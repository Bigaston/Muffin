import React, { useEffect, useState } from "react";

import axios from "axios";
import config from "../../config.json"

import Episode from "../../component/episode";
import FullLoad from "../../component/fullLoader";

import "./podcast.css";

export default function Podcast() {
	let [podcast, setPodcast] = useState({})
	let [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios({
			method: "GET",
			url: config.host + "/api/podcast/get_info"
		}).then(res => {
			if (res.status === 200) {
				setInterval(() => {
					setIsLoading(false)
				}, 200)
				setPodcast(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [])

	return (
		<>
			<FullLoad loading={isLoading} />
			<div className="headerBox">
				<div className="header" style={{ backgroundImage: "url(" + config.host + podcast.logo + ")" }}></div>
			</div>
			<div className="hoverHeader" overflow="hidden"></div>
			<div className="hoverHeader2" overflow="hidden"></div>
			<div className="topPage">
				<div className="topLeft">
					<img src={config.host + podcast.logo} alt={"Logo de " + podcast.title} />
				</div>
				<div className="topRight">
					<h1>{podcast.title}</h1>
					<p className="slogan">{podcast.slogan}</p>
					<p className="description">{podcast.description}</p>
				</div>
			</div>
			<div className="buttonDiv">
				<a href={config.host + "/rss"}><img src={config.host + "/public/logo/rss.svg"} alt="RSS" /></a>
			</div>
			{podcast.episodes !== undefined ?
				<div>
					{podcast.episodes.map((episode) => (
						<Episode key={episode.slug} episode={episode} podcast={podcast} />
					))}
				</div>
				: <></>}
		</>
	)
}