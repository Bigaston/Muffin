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
	let [playlist, setPlaylist] = useState({});
	let { id } = useParams();

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/playlist/get_playlist/" + id,
		}).then(res => {
			if (res.status === 200) {
				setPlaylist(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState, id])

	function handleAllInput(event) {
		let new_info = { ...playlist };

		new_info[event.target.attributes.id.nodeValue] = event.target.value;
		setPlaylist(new_info)
	}

	let [isSlugOk, setIsSlugOk] = useState(true);
	function handleSlug(event) {
		let new_info = { ...playlist };

		new_info.slug = event.target.value;

		setPlaylist(new_info)

		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/playlist/check_slug/" + event.target.value
		}).then(res => {
			if (res.status === 200) {
				setIsSlugOk(res.data.ok);
			}
		})
	}

	let [errorMessage, setErrorMessage] = useState("");
	function savePlaylist() {
		if (!playlist.title || !playlist.slug || !playlist.description) {
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
			url: config.host + "/api/admin/playlist/edit",
			data: playlist
		}).then(res => {
			alert("Playlist sauvegardé!");
			history.push("/a/playlists")
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
						url: config.host + "/api/admin/playlist/edit_playlist_img/" + id,
						data: {
							image: base64
						},
						onUploadProgress: progressEvent => {
							setPercentCompleted(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
						}
					}).then(res => {
						if (res.status === 200) {
							setOpenEditImage(false);

							let reload_img = { ...playlist }
							reload_img.img = config.host + "/img/playlist_" + id + ".jpg#" + Date.now()

							setPlaylist(reload_img)
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
			url: config.host + "/api/admin/playlist/delete_playlist_img/" + id,
		}).then(res => {
			if (res.status === 200) {
				let reload_img = { ...playlist }
				reload_img.img = config.host + "/img/pod.jpg#" + Date.now()

				setPlaylist(reload_img)
			}
		}).catch(err => {
			console.log(err)
		})
	}

	return (
		<>
			<Helmet>
				<title>Modifier une playlist - Muffin</title>
			</Helmet>
			<div className="episodeEditContainer">
				<h1>Modifier une playlist</h1>

				<label htmlFor="title">Titre de la playlist*</label>
				<input className="u-full-width" type="text" id="title" value={playlist.title} onChange={handleAllInput} />

				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={playlist.description} onChange={handleAllInput}></textarea>
				<p className="info">({playlist.description ? playlist.description.length : "0"}/255)</p>

				<label htmlFor="slug">Lien de le la playlist*</label>
				<input className="u-full-width" style={{ borderColor: !isSlugOk ? "red" : undefined }} type="text" id="slug" value={playlist.slug} onChange={handleSlug} />
				<p className="info">(Le lien pour accéder à votre playlist, exemple : muffin.pm/p/<span className="bold">playlist1</span>)</p>

				{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : <></>}
				<button className="button-primary" onClick={savePlaylist}>Enregistrer</button>

				<p className="fakeLabel">Logo</p>
				<img className="podcastLogo" src={config.host + playlist.img} alt="Logo de la playlist" />
				<button onClick={editImage}>Modifier l'image</button> <button className="button-delete" onClick={deleteImage}>Supprimer l'image</button>

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
		</>
	)
}