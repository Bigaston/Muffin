import React, { useState, useEffect, useRef } from "react";

import './widget.css'

import axios from "axios";
import config from "../../config.json"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

import { Helmet } from "react-helmet";

export default function ImportPodcast() {
	const [userState,] = useRecoilState(userAtom);
	const [episodes, setEpisodes] = useState([]);
	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/ep_list"
		}).then(res => {
			if (res.status === 200) {
				setEpisodes([{ id: 0, slug: "latest", title: "Toujours le dernier épisode" }, ...res.data]);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState])

	const [selectedEpisode, setSelectedEpisode] = useState("latest");
	const handleSelect = (event) => { setSelectedEpisode(event.target.value) }
	const [selectedTheme, setSelectedTheme] = useState("white")
	const [displayEpList, setDisplayEpList] = useState(true);
	const [playerString, setPlayerString] = useState("");
	const divResult = useRef();
	const inputResult = useRef();

	function generatePlayer() {
		let host = window.location.protocol + "//" + window.location.hostname

		if (!!window.location.port) { host = host + ":" + window.location.port }
		const chaine = `<iframe src="${host}/player/${selectedEpisode}?theme=${selectedTheme}${!displayEpList ? "&hide_list=" : ""}" width="100%" style="border: none;" id="muffin_player_div"></iframe><script src="${host}/public/player.js"></script>`

		setPlayerString(chaine);
		divResult.current.innerHTML = chaine;
	}

	function clickResult() {
		inputResult.current.select();
		document.execCommand('copy');

		Toastify({
			text: "Widget copié dans votre presse papier!",
			duration: 1500,
			newWindow: true,
			close: true,
			gravity: "bottom",
			position: 'center',
			backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
		}).showToast();
	}

	return (
		<>
			<Helmet>
				<title>Intégrer un épisode - Muffin</title>
			</Helmet>
			<div className="widgetContainer">
				<h1>Intégrer un épisode</h1>
				<p>Ici vous pourrez générer un player de podcast que vous pourrez intégrer sur d'autres sites internets. Le player va automatiquement s'adapter à la largeur qu'il dispose.</p>
				<p>Si il a plus que 490px de large, il sera au format horizontal, si il a moins, il sera au format vertical.</p>
				<p>Vous pouvez définir vous mêmes la largeur du player, ou alors la laisser à 100% et laisser le script joint. Celui-ci permet de modifier la hauteur de l'intégration en fonction du format, automatiquement.</p>

				<label htmlFor="type">Episode</label>
				<select className="u-full-width" id="type" value={selectedEpisode} onChange={handleSelect}>
					{episodes.map(ep => (
						<option value={ep.slug} key={ep.id}>{ep.title}</option>
					))}
				</select>

				<label htmlFor="type">Thème</label>
				<select className="u-full-width" id="type" value={selectedTheme} onChange={(event) => { setSelectedTheme(event.target.value) }}>
					<option value="white">Clair</option>
					<option value="black">Sombre</option>
				</select>

				<input type="checkbox" id="explicit" defaultChecked={true} value={displayEpList} onChange={(e) => { setDisplayEpList(e.target.checked) }} />
				<span className="label-body">Proposer d'afficher la liste des épisodes</span>

				<button className="button-primary" onClick={generatePlayer}>Générer</button>

				{!!playerString ?
					<>
						<input ref={inputResult} type="text" className="u-full-width resultInput" readOnly value={playerString} onClick={clickResult} />
					</>
					: <></>}

				<div ref={divResult}></div>
			</div>
		</>
	)
}