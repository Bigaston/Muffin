import React, { useState, useEffect, useRef } from "react";

import "./add_episode.css"

import axios from "axios";
import config from "../../config.json";
import { toBase64 } from "../../utils"

import Modal from "../../component/modal";

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { useHistory } from "react-router-dom"

import { Helmet } from "react-helmet";

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export default function Podcast() {
	let history = useHistory();
	let [userState,] = useRecoilState(userAtom);
	let [episode, setEpisode] = useState({})
	const [playlists, setPlaylists] = useState([]);

	const [openedTranscript, setOpenedTranscript] = useState(false);
	const transcriptFile = useRef(undefined);

	function p(date) {
		return date < 10 ? "0" + date : date
	}

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast"
		}).then((res) => {
			if (res.status === 200) {
				let date = new Date();

				let new_info = {
					author: res.data.author,
					pub_date: p(date.getDate()) + "/" + p(date.getMonth() + 1) + "/" + p(date.getFullYear()) + " " + p(date.getHours()) + ":" + p(date.getMinutes()),
					episode: res.data.last_ep,
					saison: res.data.last_saison,
					explicit: false,
					title: "",
					description: "",
					type: "full",
					slug: "",
					small_desc: "",
					transcript: ""
				}

				setEpisode(new_info)
			}
		})

		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/playlist/get_all_playlist",
		}).then(res => {
			setPlaylists(res.data)
		}).catch(err => {
			console.log(err);
		})
	}, [userState])

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

	let filepicker_img = useRef(undefined);
	let filepicker_audio = useRef(undefined);
	let [percentCompleted, setPercentCompleted] = useState(0);
	let [errorMessage, setErrorMessage] = useState("");
	let [during, setDuring] = useState(false);

	function uploadEpisode() {
		if (during) return;
		if (!episode.title || !episode.slug || !episode.small_desc || !episode.author || !episode.pub_date || !episode.type || episode.episode === undefined || episode.saison === undefined || !episode.description || filepicker_audio.current.files.length !== 1) {
			setErrorMessage("L'un des champs obligatoire n'est pas remplis! Merci de complêter tous les champs avec *");
			return;
		}

		if (!isSlugOk) {
			setErrorMessage("Le lien que vous avez entré n'est pas valide");
			return;
		}

		setDuring(true);

		setErrorMessage("")

		// Vérification de si l'image est de la bonne taille
		if (filepicker_img.current.files.length === 1) {
			let file_img = filepicker_img.current.files[0];
			let img = new Image();
			img.src = window.URL.createObjectURL(file_img)

			img.onload = () => {
				if (img.naturalHeight === img.naturalWidth) {
					toBase64(file_img).then(base64img => {
						afterImageCheck(base64img)
					}).catch(err => {
						console.log(err)
					})
				} else {
					setErrorMessage("Votre image doit être au format carré!")
					setDuring(false);
					return;
				}
			}
		} else {
			afterImageCheck(null)
		}

		function afterImageCheck(base64img) {
			toBase64(filepicker_audio.current.files[0]).then(base64audio => {
				let data_ep = { ...episode };

				data_ep.enclosure = base64audio;
				data_ep.img = base64img

				let my_playlist = [];

				playlists.forEach(pl => {
					if (pl.added) {
						my_playlist.push(pl.id);
					}
				})

				data_ep.playlists = my_playlist;
				data_ep.pub_date = dayjs(data_ep.pub_date, "DD/MM/YYYY hh:mm")

				if (transcriptFile.current && transcriptFile.current.files.length !== 0) {
					toBase64(transcriptFile.current.files[0]).then(base64srt => {
						data_ep.transcript_file_raw = base64srt;
						continueTraitement()
					})
				} else {
					continueTraitement();
				}

				function continueTraitement() {
					axios({
						method: "POST",
						headers: {
							"Authorization": "Bearer " + userState.jwt
						},
						url: config.host + "/api/admin/podcast/new_episode",
						data: data_ep,
						onUploadProgress: progressEvent => {
							setPercentCompleted(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
						}
					}).then(res => {
						if (res.status === 200) {
							history.push("/a/episodes")
						}
					}).catch(err => {
						console.log(err)
						setDuring(false);
					})
				}
			}).catch(err => {
				console.log(err)
				setDuring(false);
			})
		}
	}

	const [openAddPlaylist, setOpenAddPlaylist] = useState(false)

	function handleOpenAddPlaylist() {
		setOpenAddPlaylist(true);
	}

	function handleChangePlaylist(checked, index) {
		setPlaylists(current => {
			current[index].added = checked;

			return current;
		})
	}

	return (
		<>
			<Helmet>
				<title>Créer un épisode - Muffin</title>
			</Helmet>
			<div className="addEpisodeContainer">
				<h1>Créer un épisode</h1>

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

				<input type="checkbox" id="explicit" value={episode.explicit} onChange={handleCheckbox} />
				<span className="label-body">Contenu explicite</span>

				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={episode.description} onChange={handleAllInput}></textarea>
				<p className="info">(Pour faire de la mise en page, utilisez le Markdown!)</p>

				<label htmlFor="small_desc">Description courte*</label>
				<textarea className="u-full-width" id="small_desc" value={episode.small_desc} onChange={handleAllInput}></textarea>
				<p className="info">({episode.small_desc ? episode.small_desc.length : "0"}/255)</p>

				<label htmlFor="slug">Lien de l'épisode*</label>
				<input className="u-full-width" style={{ borderColor: !isSlugOk ? "red" : undefined }} type="text" id="slug" value={episode.slug} onChange={handleSlug} />
				<p className="info">(Le lien pour accéder à votre épisode, exemple : muffin.pm/<span className="bold">episode1</span>)</p>

				<label htmlFor="img">Image de l'épisode</label>
				<input type="file" id="img" ref={filepicker_img} accept="image/png, image/jpeg" />
				<p className="info">(Si vous n'en entrez pas, l'image utilisée sera celle du podcast)</p>

				<label htmlFor="enclosure">Audio de l'épisode*</label>
				<input type="file" id="enclosure" ref={filepicker_audio} accept="audio/mpeg" />

				<button className="full" onClick={handleOpenAddPlaylist}>Ajouter à une playlist</button>

				<p className="fakeLabel hoverable" onClick={() => { setOpenedTranscript(c => !c) }}>{openedTranscript ? "▼" : "▶"} Ajout d'un transcript</p>
				{openedTranscript ?
					<>
						<label htmlFor="transcript">Texte du transcript</label>
						<textarea className="u-full-width" id="transcript" value={episode.transcript} onChange={handleAllInput}></textarea>

						<label htmlFor="transcript_file">Ajouter un fichier de transcript</label>
						<input type="file" id="transcript_file" ref={transcriptFile} accept=".srt" />

						<p className="info">Le texte du transcript sera affiché uniquement sur la page de votre épisode. Le fichier de transcript au format .srt sera lui exposé dans le flux RSS, et affiché sur la page de l'épisode, avec des timecodes pour laisser les utilisateurs sauter directement au bon moment dans l'épisode</p>
					</>
					: null}

				{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : <></>}
				<button className="button-primary" onClick={uploadEpisode}>Créer l'épisode</button>
				{during ?
					<progress max="100" value={percentCompleted} />
					: <></>}

				<Modal open={openAddPlaylist} onCancel={() => { setOpenAddPlaylist(false) }}>
					<h1>Ajouter à une/plusieurs playlists</h1>
					<div className="playlistContainer">
						<ul>
							{playlists.map((pl, index) => (
								<li key={pl.id}>
									<input type="checkbox" id="explicit" value={pl.added} defaultChecked={pl.added} onChange={(event) => { handleChangePlaylist(event.target.checked, index) }} />
									<span className="labelCheck">{pl.title}</span>
								</li>
							))}
						</ul>

					</div>
					<button onClick={() => { setOpenAddPlaylist(false) }}>Fermer</button>
				</Modal>
			</div>
		</>
	)
}