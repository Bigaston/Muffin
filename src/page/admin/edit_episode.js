import React, { useEffect, useState, useRef } from "react";

import "./edit_episode.css"

import axios from "axios";
import config from "../../config.json";
import Modal from "../../component/modal"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { toBase64 } from "../../utils"

import { useParams } from "react-router-dom"

import { Helmet } from "react-helmet";

import { useHistory } from "react-router-dom"

export default function Podcast() {
	let history = useHistory()
	let [userState,] = useRecoilState(userAtom);
	let [episode, setEpisode] = useState({});
	let { id } = useParams();

	function p(date) {
		return date < 10 ? "0" + date : date
	}

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/episode/" + id,
		}).then(res => {
			if (res.status === 200) {
				let data_ep = { ...res.data };
				let date = new Date(data_ep.pub_date);

				data_ep.pub_date = p(date.getDate()) + "/" + p(date.getMonth() + 1) + "/" + p(date.getFullYear()) + " " + p(date.getHours()) + ":" + p(date.getMinutes());
				data_ep.audio = data_ep.audio + "#" + Date.now();

				setEpisode(data_ep)
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState, id])

	function handleAllInput(event) {
		let new_info = { ...episode };

		new_info[event.target.attributes.id.nodeValue] = event.target.value;
		setEpisode(new_info)
	}

	function handleCheckbox(event) {
		let new_info = { ...episode };

		new_info.explicit = event.target.checked;

		setEpisode(new_info)
	}

	let [isSlugOk, setIsSlugOk] = useState(true);
	function handleSlug(event) {
		let new_info = { ...episode };

		new_info.slug = event.target.value;

		setEpisode(new_info)

		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/check_slug/" + event.target.value
		}).then(res => {
			if (res.status === 200) {
				setIsSlugOk(res.data.ok);
			}
		})
	}

	let [errorMessage, setErrorMessage] = useState("");
	function saveEp() {
		if (!episode.title || !episode.slug || !episode.small_desc || !episode.author || !episode.pub_date || !episode.type || episode.episode === undefined || episode.saison === undefined || !episode.description) {
			setErrorMessage("L'un des champs obligatoire n'est pas remplis! Merci de complêter tous les champs avec *");
			return;
		}

		if (!isSlugOk) {
			setErrorMessage("Le lien que vous avez entré n'est pas valide");
			return;
		}

		setErrorMessage("");

		axios({
			method: "POST",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/save",
			data: episode
		}).then(res => {
			alert("Episode sauvegardé!");
			history.push("/a/episodes")
			console.log(res)
		}).catch(err => {
			console.log(err);
		})
	}

	let [openEditImage, setOpenEditImage] = useState(false);
	let filepicker_image = useRef(undefined)
	let [errorMessageImg, setErrorMessageImg] = useState("");
	let [percentCompleted, setPercentCompleted] = useState(0);

	function editImage() {
		setOpenEditImage(true)
		setPercentCompleted(0);
	}

	function validImage() {
		if (filepicker_image.current.files.length !== 1) {
			setErrorMessageImg("Merci de sélectionner une image!")
			return;
		}

		setErrorMessageImg("");

		// Vérification de si l'image est de la bonne taille
		let file = filepicker_image.current.files[0];
		let img = new Image();
		img.src = window.URL.createObjectURL(file)

		img.onload = () => {
			if (img.naturalHeight === img.naturalWidth) {
				toBase64(file).then(base64 => {
					axios({
						method: "POST",
						headers: {
							"Authorization": "Bearer " + userState.jwt
						},
						url: config.host + "/api/admin/podcast/edit_ep_img/" + id,
						data: {
							image: base64
						},
						onUploadProgress: progressEvent => {
							setPercentCompleted(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
						}
					}).then(res => {
						if (res.status === 200) {
							setOpenEditImage(false);

							let reload_img = { ...episode }
							reload_img.img = config.host + "/img/" + id + ".jpg#" + Date.now()

							setEpisode(reload_img)
						}
					}).catch(err => {
						console.log(err)
					})
				}).catch(err => {
					console.log(err)
				})
			} else {
				setErrorMessageImg("Votre image doit être au format carré!")
				return;
			}
		}
	}

	function deleteImage() {
		axios({
			method: "DELETE",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/delete_ep_img/" + id,
		}).then(res => {
			if (res.status === 200) {
				let reload_img = { ...episode }
				reload_img.img = config.host + "/img/pod.jpg#" + Date.now()

				setEpisode(reload_img)
			}
		}).catch(err => {
			console.log(err)
		})
	}

	let [openEditAudio, setOpenEditAudio] = useState(false);
	let filepicker_audio = useRef(undefined)
	let [percentCompletedAudio, setPercentCompletedAudio] = useState(0);
	let [errorMessageAudio, setErrorMessageAudio] = useState("");
	let [during, setDuring] = useState(false)

	function editAudio() {
		setOpenEditAudio(true)
		setPercentCompletedAudio(0);
	}

	function validAudio() {
		if (during) return;
		if (filepicker_audio.current.files.length !== 1) {
			setErrorMessageAudio("Merci de sélectionner un fichier audio!")
			return;
		}

		setErrorMessageAudio("");
		setDuring(true);

		toBase64(filepicker_audio.current.files[0]).then(base64audio => {
			axios({
				method: "POST",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				url: config.host + "/api/admin/podcast/edit_ep_audio/" + id,
				data: {
					enclosure: base64audio
				},
				onUploadProgress: progressEvent => {
					setPercentCompletedAudio(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
				}
			}).then(res => {
				if (res.status === 200) {
					setOpenEditAudio(false);

					window.location.reload();
				}
			}).catch(err => {
				console.log(err)
				setDuring(false);
			})
		}).catch(err => {
			console.log(err)
			setDuring(false);
		})
	}

	return (
		<>
			<Helmet>
				<title>Modifier un épisode - Muffin</title>
			</Helmet>
			<div className="episodeEditContainer">
				<h1>Modifier un épisode</h1>

				<label htmlFor="title">Titre de l'épisode*</label>
				<input className="u-full-width" type="text" id="title" value={episode.title} onChange={handleAllInput} />
				<label htmlFor="author">Auteur de épisode*</label>
				<input className="u-full-width" type="text" id="author" value={episode.author} onChange={handleAllInput} />
				<label htmlFor="pub_date">Date de publication*</label>
				<input className="u-full-width" type="text" id="pub_date" value={episode.pub_date} onChange={handleAllInput} />

				<div className="row">
					<div className="four columns">
						<label htmlFor="type">Type d'épisode*</label>
						<select className="u-full-width" id="type" value={episode.type} onChange={handleAllInput}>
							<option value="full">Episode</option>
							<option value="trailer">Bande annonce</option>
							<option value="bonus">Bonus</option>
						</select>
					</div>
					<div className="four columns">
						<label htmlFor="episode">N° D'épisode*</label>
						<input className="u-full-width" type="number" id="episode" value={episode.episode} onChange={handleAllInput} />
					</div>
					<div className="four columns">
						<label htmlFor="saison">N° De Saison*</label>
						<input className="u-full-width" type="number" id="saison" value={episode.saison} onChange={handleAllInput} />
					</div>
				</div>
				<p className="info">(Mettez 0 comme numéro de saison ou d'épisode si cela ne correspond pas à votre podcast)</p>
				<input type="checkbox" id="explicit" defaultChecked={episode.explicit} value={episode.explicit} onChange={handleCheckbox} />
				<span className="label-body">Contenu explicite</span>

				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={episode.description} onChange={handleAllInput}></textarea>
				<p className="info">(Pour faire de la mise en page, utilisez le Markdown!)</p>

				<label htmlFor="small_desc">Description courte*</label>
				<textarea className="u-full-width" id="small_desc" value={episode.small_desc} onChange={handleAllInput}></textarea>
				<p className="info">({episode.small_desc ? episode.small_desc.length : "0"}/255)</p>

				<label htmlFor="slug">Lien de l'épisode*</label>
				<input className="u-full-width" style={{ borderColor: !isSlugOk ? "red" : undefined }} type="text" id="slug" value={episode.slug} onChange={handleSlug} />
				<p className="info">(Le lien pour accèter à votre épisode, exemple : muffin.pm/<span className="bold">episode1</span>)</p>

				{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : <></>}
				<button className="button-primary" onClick={saveEp}>Enregistrer</button>

				<p className="fakeLabel">Logo</p>
				<img className="podcastLogo" src={config.host + episode.img} alt="Logo de l'épisode" />
				<button onClick={editImage}>Modifier l'image</button> <button className="button-delete" onClick={deleteImage}>Supprimer l'image</button>

				<p className="fakeLabel">Audio de l'épisode</p>
				<audio className="podcastAudio" src={config.host + episode.audio} alt="Audio de l'épisode" controls />
				<button onClick={editAudio}>Modifier l'audio</button>
			</div>

			<Modal open={openEditImage} onCancel={() => { setOpenEditImage(false) }}>
				<h1>Modifier l'image</h1>
				<input type="file" ref={filepicker_image} accept="image/png, image/jpeg" />
				{!!errorMessageImg ? <p className="errorMessageImg">{errorMessageImg}</p> : <></>}
				<button className="button-primary" onClick={validImage}>Valider</button> <button onClick={() => { setOpenEditImage(false) }}>Annuler</button>
				{percentCompleted !== 0 ?
					<progress max="100" value={percentCompleted} />
					: <></>}
			</Modal>

			<Modal open={openEditAudio} onCancel={() => { setOpenEditAudio(false) }}>
				<h1>Modifier l'audio</h1>
				<input type="file" ref={filepicker_audio} accept="audio/mpeg" />
				{!!errorMessageAudio ? <p className="errorMessageImg">{errorMessageAudio}</p> : <></>}
				<button className="button-primary" onClick={validAudio}>Valider</button> <button onClick={() => { setOpenEditAudio(false) }}>Annuler</button>
				{percentCompletedAudio !== 0 ?
					<progress max="100" value={percentCompletedAudio} />
					: <></>}
			</Modal>
		</>
	)
}