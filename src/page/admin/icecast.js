import React, { useState, useEffect } from "react";

import './icecast.css'
import "./global.css"

import axios from "axios";
import config from "../../config.json"

import userAtom from "../../stores/user";
import streamAtom from "../../stores/stream";
import { useRecoilState } from "recoil";

import { Helmet } from "react-helmet";

export default function ImportPodcast() {
	const [userState,] = useRecoilState(userAtom);
	const [streamState,] = useRecoilState(streamAtom)
	const [stream, setStream] = useState({});
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/icecast/info"
		}).then(res => {
			if (res.status === 200) {
				setStream(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState])

	function handleAllInput(event) {
		let new_info = { ...stream };

		new_info[event.target.attributes.id.nodeValue] = event.target.value;
		setStream(new_info)
	}

	function handleCheckbox(event) {
		let new_info = { ...stream };

		new_info.record_episode = event.target.checked;

		setStream(new_info)
	}

	function handleCheckboxPublish(event) {
		let new_info = { ...stream };

		new_info.publish_instant = event.target.checked;

		setStream(new_info)
	}

	function save() {
		if (!stream.title || !stream.description || !stream.small_desc || !stream.url || !stream.mountpoint) {
			setErrorMessage("Merci de complêter tous les champs!")
			return;
		}

		setErrorMessage("");

		axios({
			method: "POST",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/icecast/save",
			data: stream
		}).then(res => {
			if (res.status === 200) {
				window.alert("Informations enregistrées!")
			}
		}).catch(err => {
			console.log(err)
		})
	}

	return (
		<>
			<Helmet>
				<title>Icecast - Muffin</title>
			</Helmet>
			<div className="container icecastContainer">
				<h1>Icecast</h1>
				<p>Vous pouvez configuer Muffin pour qu'il affiche automatiquement (et enregistre si vous voulez) vos lives sur Icecast. Si vous n'avez pas de serveur Icecast, un conteneur Docker est disponible <a href="https://hub.docker.com/repository/docker/bigaston/muffinicecast" target="_blank" rel="noreferrer">ici</a>.</p>

				<h2>Modifier les paramètres</h2>
				<label htmlFor="title">Titre de l'épisode*</label>
				<input className="u-full-width" type="text" id="title" value={stream.title} onChange={handleAllInput} />

				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={stream.description} onChange={handleAllInput}></textarea>
				<p className="info">(Pour faire de la mise en page, utilisez le Markdown!)</p>

				<label htmlFor="small_desc">Description courte*</label>
				<textarea className="u-full-width" id="small_desc" value={stream.small_desc} onChange={handleAllInput}></textarea>
				<p className="info">({stream.small_desc ? stream.small_desc.length : "0"}/255)</p>

				<h2>Paramètres de Icecast</h2>
				{streamState.stream ? <p className="errorMessage">Vous êtes en train de faire un live. Ces paramètres ne sont pas modifiables tant que ce live n'est pas terminé</p> : null}
				<label htmlFor="mountpoint">Mountpoint*</label>
				<input className="u-full-width" type="text" id="mountpoint" value={stream.mountpoint} onChange={handleAllInput} disabled={streamState.stream} />
				<label htmlFor="url">Adresse générale du serveur Icecast*</label>
				<input className="u-full-width" type="url" id="url" value={stream.url} onChange={handleAllInput} disabled={streamState.stream} />

				<input type="checkbox" id="record_episode" defaultChecked={stream.record_episode} value={stream.record_episode} onClick={handleCheckbox} disabled={streamState.stream} />
				<span className="label-body">Enregistrer l'épisode (Pris en compte au prochain stream)</span>
				{stream.record_episode ?
					<>
						<br />
						<input type="checkbox" id="publish_instant" defaultChecked={stream.publish_instant} value={stream.publish_instant} onClick={handleCheckboxPublish} disabled={streamState.stream} />
						<span className="label-body">Publier automatiquement l'épisode (Pris en compte au prochain stream)</span>
					</>
					: null}
				<p className="info">(Vos streams seront directement enregistrés par Muffin, et ajouté à votre liste d'épisode avec une date de publication de 2100. Il vous restera plus qu'à éditer ces informations)</p>

				{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
				<button className="button-primary u-full-width" onClick={save}>Enregistrer</button>
			</div>
		</>
	)
}