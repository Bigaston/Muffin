import React, { useEffect, useState } from "react";

import axios from "axios";
import config from "../../config.json"

import Episode from "../../component/episode";
import FullLoad from "../../component/fullLoader";
import ToAbout from "../../component/to_about"

import { Helmet } from "react-helmet";

import "./playlist.css";

import { useHistory, Link, useParams } from "react-router-dom"

export default function Podcast() {
	let { slug } = useParams();
	let history = useHistory();
	let [podcast, setPodcast] = useState({})
	const [playlist, setPlaylist] = useState([]);
	let [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		axios({
			method: "GET",
			url: config.host + "/api/podcast/get_info"
		}).then(res => {
			if (res.status === 200) {
				axios({
					method: "GET",
					url: config.host + "/api/playlist/get_one_info/" + slug
				}).then(res => {
					if (res.status === 200) {
						setInterval(() => {
							setIsLoading(false)
						}, 200)

						setPlaylist(res.data.playlist);
					}
				}).catch(err => {
					console.log(err)
				})
				setPodcast(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [slug])

	return (
		<>
			<FullLoad loading={isLoading} />
			<img className="backToMenuImg" src={config.host + "/public/arrow-left.svg"} alt="Retourner à l'index" onClick={() => { history.push("/#playlist") }} />
			{playlist !== undefined ?
				<>
					<Helmet>
						<title>{playlist.title + " - " + podcast.title}</title>
						<meta property="og:title" content={playlist.title + " - " + podcast.title}></meta>
						<meta property="og:site_name" content={podcast.title}></meta>
						<meta property="og:description" content={playlist.description}></meta>
						<meta name="description" content={playlist.description}></meta>
						<meta property="og:type" content="blog"></meta>
						<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + playlist.img}></meta>
						<meta property="og:url" content={window.location.protocol + "//" + window.location.hostname}></meta>
						<meta property="theme-color" content="#edbb9a"></meta>
						<link href={window.location.protocol + "//" + window.location.hostname + "/rss"} rel="alternate" type="application/rss+xml" title={podcast.title}></link>
					</Helmet>
					<div className="headerBox">
						<div className="header" style={{ backgroundImage: "url(" + config.host + podcast.logo + ")" }}></div>
					</div>
					<div className="hoverHeader" overflow="hidden"></div>
					<div className="hoverHeader2" overflow="hidden"></div>
					<div className="topPage">
						<div className="topLeft">
							<img src={config.host + playlist.img} alt={"Logo de " + playlist.title} />
						</div>
						<div className="topRight">
							<h1>{playlist.title}</h1>
							<p className="description">{playlist.description}</p>
						</div>
					</div>
					<>
						<div>
							{playlist?.Episodes?.map((episode) => (
								<Episode key={episode.slug} episode={episode} podcast={podcast} />
							))}
						</div>
					</>
				</>
				: <>
					<>
						<Helmet>
							<title>{"Playlist non trouvée - " + podcast.title}</title>
							<meta property="og:title" content={"Playlist non trouvée - " + podcast.title}></meta>
							<meta property="og:description" content={podcast.description}></meta>
							<meta name="description" content={podcast.description}></meta>
							<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + "/img/pod.jpg"}></meta>
						</Helmet>
						<div className="headerBox">
							<div className="header" style={{ backgroundImage: "url(" + config.host + podcast.logo + ")" }}></div>
						</div>
						<div className="hoverHeader" overflow="hidden"></div>
						<div className="hoverHeader2" overflow="hidden"></div>
						<div className="topPageEpisode">
							<img src={config.host + podcast.logo} alt={"Logo de " + podcast.title} />
						</div>

						<div className="content">
							<h2 className="contentHeader">Cette playlist n'existe pas :/</h2>
							<p className="backToMenu"><Link to="/">Retourner au menu</Link></p>
						</div>
					</>
				</>}

			<ToAbout />
		</>
	)
}