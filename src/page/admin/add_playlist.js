import React, { useState, useRef } from "react";

import "./add_playlist.css"

import axios from "axios";
import config from "../../config.json";
import { toBase64 } from "../../utils"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { useHistory } from "react-router-dom"

import { Helmet } from "react-helmet";

export default function Podcast() {
	let history = useHistory();
	let [userState,] = useRecoilState(userAtom);
	let [playlist, setPlaylist] = useState({ title: "", description: "", slug: "" })

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
		}).catch(err => {
			console.log(err);
		})
	}

	let filepicker_img = useRef(undefined);
	let [percentCompleted, setPercentCompleted] = useState(0);
	let [errorMessage, setErrorMessage] = useState("");
	let [during, setDuring] = useState(false);

	function uploadEpisode() {
		if (during) return;
		if (!playlist.title || !playlist.slug || !playlist.description) {
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
			let data_pl = { ...playlist };

			data_pl.img = base64img

			axios({
				method: "POST",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				url: config.host + "/api/admin/playlist/new_playlist",
				data: data_pl,
				onUploadProgress: progressEvent => {
					setPercentCompleted(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
				}
			}).then(res => {
				if (res.status === 200) {
					history.push("/a/playlists")
				}
			}).catch(err => {
				console.log(err)
				setDuring(false);
			})
		}
	}

	return (
		<>
			<Helmet>
				<title>Créer une playlist - Muffin</title>
			</Helmet>
			<div className="addPlaylistContainer">
				<h1>Créer une playlist</h1>

				<label htmlFor="title">Titre de la playlist*</label>
				<input className="u-full-width" type="text" id="title" value={playlist.title} onChange={handleAllInput} />

				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={playlist.description} onChange={handleAllInput}></textarea>
				<p className="info">({playlist.description ? playlist.description.length : "0"}/255)</p>

				<label htmlFor="slug">Lien de le la playlist*</label>
				<input className="u-full-width" style={{ borderColor: !isSlugOk ? "red" : undefined }} type="text" id="slug" value={playlist.slug} onChange={handleSlug} />
				<p className="info">(Le lien pour accéder à votre playlist, exemple : muffin.pm/p/<span className="bold">playlist1</span>)</p>

				<label htmlFor="img">Image de la playlist</label>
				<input type="file" id="img" ref={filepicker_img} accept="image/png, image/jpeg" />
				<p className="info">(Si vous n'en entrez pas, l'image utilisée sera celle du podcast)</p>

				{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : <></>}
				<button className="button-primary" onClick={uploadEpisode}>Créer l'épisode</button>
				{during ?
					<progress max="100" value={percentCompleted} />
					: <></>}
			</div>
		</>
	)
}