import React, {useEffect, useState} from "react";

import axios from "axios";
import config from "../config.json"

import "./podcast.css";

export default function Podcast() {
	let [podcast, setPodcast] = useState({})

	useEffect(() => {
		axios({
			method: "GET",
			url: config.host + "/api/podcast/get_info"
		}).then(res => {
			if (res.status === 200) {
				setPodcast(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [])

	return(
		<>
			<div className="headerBox">
				<div className="header" style={{backgroundImage: "url(" + config.host + podcast.logo + ")"}}></div>
			</div>
			<div className="hoverHeader" overflow="hidden"></div>
			<div className="hoverHeader2" overflow="hidden"></div>
			<div className="topPage">
				<div className="topLeft">
					<img src={config.host + podcast.logo}	alt={"Logo de " + podcast.title} />		
				</div>
				<div className="topRight">
					<h1>{podcast.title}</h1>
					<p className="slogan">{podcast.slogan}</p>
					<p className="description">{podcast.description}</p>
				</div>
			</div>
			<div class="content">
				<p>Bonjour</p>
			</div>
		</>
	)
}