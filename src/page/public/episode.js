import React, {useEffect, useState, useRef} from "react";

import axios from "axios";
import config from "../../config.json"
import {Link, useHistory} from "react-router-dom"

import Loader from "../../component/loader"

import {useParams} from "react-router-dom";

import playerAtom from "../../stores/player";
import {useRecoilState} from "recoil";

import "./episode.css";

export default function EpisodePage() {
	let [playerStore, setPlayerStore] = useRecoilState(playerAtom);
	let history = useHistory();
	let {slug} = useParams();
	let [episode, setEpisode] = useState({});
	let [podcast, setPodcast] = useState({});
	let [isNotFound, setIsNotFound] = useState(false);
	let [pubDateString, setPubDateString] = useState("");

	let divDescription = useRef(undefined)

	useEffect(() => {
		let month_tab = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

		axios({
			method: "GET",
			url: config.host + "/api/podcast/get_ep_info/" + slug
		}).then(res => {
			if (res.data.episode !== undefined) {
				setEpisode(res.data.episode)
				setPodcast(res.data.podcast)
				divDescription.current.innerHTML = res.data.episode.description

				let pub_date = new Date(res.data.episode.pub_date);
				setPubDateString("Publié le " + pub_date.getDate() === 1 ? "1er" : pub_date.getDate() + " " + month_tab[pub_date.getMonth()] + " " + pub_date.getFullYear())
			} else {
				setPodcast(res.data.podcast);
				setIsNotFound(true);
			}

		}).catch(err => {
			console.log(err)
		})
	}, [slug])

	const handleReturnMenu = () => {
		history.push("/")
	}

	function playPauseEp() {
		if (!playerStore.displayed || playerStore.slug !== episode.slug) {
			let played_ep = {
				displayed: true,
				paused: false,
				img: episode.img,
				title: episode.title,
				slug: episode.slug,
				duration: episode.duration,
				audio: episode.audio
			}

			setPlayerStore(played_ep);
		} else if (playerStore.paused) {
			let played_ep = {
				displayed: playerStore.displayed,
				paused: false,
				img: playerStore.img,
				title: playerStore.title,
				slug: playerStore.slug,
				duration: playerStore.duration,
				audio: playerStore.audio
			}

			setPlayerStore(played_ep);
		} else if (!playerStore.paused) {
			let played_ep = {
				displayed: playerStore.displayed,
				paused: true,
				img: playerStore.img,
				title: playerStore.title,
				slug: playerStore.slug,
				duration: playerStore.duration,
				audio: playerStore.audio
			}

			setPlayerStore(played_ep);
		}
	}

	function downloadEp() {
		window.open(config.host + episode.audio)
	}

	return (
		<>
			{podcast !== undefined ?
				<>
					<img className="backToMenuImg" src={config.host + "/public/arrow-left.svg"} alt="Retourner à l'index" onClick={handleReturnMenu} />
					<div className="headerBox">
						<div className="header" style={{backgroundImage: "url(" + config.host + (episode.img !== undefined ? episode.img : podcast.logo) + ")"}}></div>
					</div>
					<div className="hoverHeader" overflow="hidden"></div>
					<div className="hoverHeader2" overflow="hidden"></div>
					<div className="topPageEpisode">
						<img src={config.host + (episode.img !== undefined ? episode.img : podcast.logo)}	alt={"Logo de " + podcast.title} />		
					</div>

					<div className="content">
						{isNotFound ? 
							<>
								<h2 className="contentHeader">Cet épisode n'existe pas :/</h2>
								<p className="backToMenu"><Link to="/">Retourner au menu</Link></p>
							</>
						:
							<>
								<h2 className="contentHeader">{episode.title}</h2>
								<div className="buttonBar">
									<img src={
										playerStore.paused === false && playerStore.slug === episode.slug ? config.host + "/public/pause.svg" : config.host + "/public/play.svg"}
										alt={playerStore.paused === false && playerStore.slug === episode.slug ? "Lire " + episode.title : "Mettre en pause " + episode.title} 
										onClick={playPauseEp} />
									<img src={config.host + "/public/download.svg"} alt="Télécharger l'épisode" onClick={downloadEp}/>
								</div>
								<div ref={divDescription} className="descriptionEp"></div>
								<p className="moreInfoEp">Publié le {pubDateString}</p>
							</>
						}
					</div>
				</>
			:<Loader/>}
		</>
	)
}