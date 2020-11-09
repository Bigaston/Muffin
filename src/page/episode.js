import React, {useEffect, useState, useRef} from "react";

import axios from "axios";
import config from "../config.json"
import {Link, useHistory} from "react-router-dom"

import Loader from "../component/loader"

import {useParams} from "react-router-dom";

import "./episode.css";

export default function EpisodePage() {
	let history = useHistory();
	let {slug} = useParams();
	let [episode, setEpisode] = useState({});
	let [podcast, setPodcast] = useState({});
	let [isNotFound, setIsNotFound] = useState(false);
	let [pubDateString, setPubDateString] = useState("");

	let divDescription = useRef(undefined)

	let month_tab = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

	useEffect(() => {
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
	}, [])

	const handleReturnMenu = () => {
		history.push("/")
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