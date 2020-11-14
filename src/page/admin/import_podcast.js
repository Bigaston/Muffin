import React, { useState } from "react";

import './import_podcast.css'

import axios from "axios";
import config from "../../config.json"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { useHistory } from "react-router-dom"

import { Helmet } from "react-helmet";

export default function ImportPodcast() {
	let history = useHistory();
	let [newRSS, setNewRSS] = useState("");
	let [userState,] = useRecoilState(userAtom);

	function importPodcast() {
		axios({
			method: "POST",
			url: config.host + "/api/admin/podcast/import",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			data: {
				url: newRSS
			}
		}).then(res => {
			alert("Votre podcast est maintenant en cours d'import. Vous devriez voir les épisodes apparaîtres au fur et à mesure de leur importation!");
			history.push("/")
		}).catch(err => {
			console.log(err)
		})
	}

	return (
		<>
			<Helmet>
				<title>Importer un podcast - Muffin</title>
			</Helmet>
			<div className="podcastImportContainer">
				<h1>Importer un podcast</h1>

				<p>Attention! Vous vous apprêtez à replacer votre podcast présent ici par un autre que vous allez importer.</p>

				<p>Vous perdrez les réglages de votre podcast. Les épisodes eux seront juste ajoutés à ceux déjà présents</p>

				<p>Si vous souhaitez continuer, entrez le lien du flux RSS que vous souhaitez importer dans le champ ci dessous</p>

				<label htmlFor="new_rss">Nouveau RSS</label>
				<input className="u-full-width" type="url" id="new_rss" value={newRSS} onChange={(event) => { setNewRSS(event.target.value) }} />

				<button className="button-delete" onClick={importPodcast}>Importer le podcast</button>
			</div>
		</>
	)
}