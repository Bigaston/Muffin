import React, { useEffect, useState } from "react";

import axios from "axios";
import config from "../../config.json"

import classnames from "classnames";

import Episode from "../../component/episode";
import FullLoad from "../../component/fullLoader";

import { Helmet } from "react-helmet";

import Playlist from "../../component/playlist";

import "./podcast.css";

export default function Podcast() {
	let [podcast, setPodcast] = useState({})
	const [playlists, setPlaylists] = useState([]);
	let [isLoading, setIsLoading] = useState(true);
	const [currentTab, setCurrentTab] = useState("episodes")

	useEffect(() => {
		axios({
			method: "GET",
			url: config.host + "/api/podcast/get_info"
		}).then(res => {
			if (res.status === 200) {
				axios({
					method: "GET",
					url: config.host + "/api/playlist/get_info"
				}).then(res => {
					if (res.status === 200) {
						setInterval(() => {
							setIsLoading(false)
						}, 200)

						setPlaylists(res.data);

						if (window.location.hash === "#playlist") {
							setCurrentTab("playlists")
						}
					}
				}).catch(err => {
					console.log(err)
				})
				setPodcast(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [])

	return (
		<>
			<Helmet>
				<title>{podcast.title}</title>
				<meta property="og:title" content={podcast.title}></meta>
				<meta property="og:site_name" content={podcast.title}></meta>
				<meta property="og:description" content={podcast.description}></meta>
				<meta name="description" content={podcast.description}></meta>
				<meta property="og:type" content="blog"></meta>
				<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + "/img/pod.jpg"}></meta>
				<meta property="og:url" content={window.location.protocol + "//" + window.location.hostname}></meta>
				<meta property="theme-color" content="#edbb9a"></meta>
				<link href={window.location.protocol + "//" + window.location.hostname + "/rss"} rel="alternate" type="application/rss+xml" title={podcast.title}></link>
			</Helmet>

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
				<a href={config.host + "/rss"}><img src={config.host + "/public/logo/rss.png"} alt="RSS" /></a>
				{!!podcast.data?.apple_podcast ? <a href={podcast.data.apple_podcast}><img src={config.host + "/public/logo/apple_podcast.png"} alt="Apple Podcast" /></a> : <></>}
				{!!podcast.data?.spotify ? <a href={podcast.data.spotify}><img src={config.host + "/public/logo/spotify.png"} alt="Spotify" /></a> : <></>}
				{!!podcast.data?.google_podcast ? <a href={podcast.data.google_podcast}><img src={config.host + "/public/logo/google_podcast.png"} alt="Google Podcast" /></a> : <></>}
				{!!podcast.data?.deezer ? <a href={podcast.data.deezer}><img src={config.host + "/public/logo/deezer.png"} alt="Deezer" /></a> : <></>}
				{!!podcast.data?.podcast_addict ? <a href={podcast.data.podcast_addict}><img src={config.host + "/public/logo/podcast_addict.png"} alt="Podcast Addict" /></a> : <></>}
				{!!podcast.data?.instagram ? <a href={podcast.data.instagram}><img src={config.host + "/public/logo/instagram.png"} alt="Instagram" /></a> : <></>}
				{!!podcast.data?.donation ? <a href={podcast.data.donation}><img src={config.host + "/public/logo/donation.png"} alt="Donation" /></a> : <></>}

			</div>

			{playlists.length === 0 ? <></>
				:
				<div className="nav">
					<p className={classnames({ current: currentTab === "episodes" })} onClick={() => { setCurrentTab("episodes") }}>{podcast.episodes?.length} épisode{podcast.episodes?.length > 1 ? "s" : ""}</p>
					<p className={classnames({ current: currentTab === "playlists" })} onClick={() => { setCurrentTab("playlists") }}>{playlists.length} playlist{playlists.length > 1 ? "s" : ""}</p>
				</div>
			}
			{currentTab === "episodes" ?
				<>
					{podcast.episodes !== undefined ?
						<div>
							{podcast.episodes.map((episode) => (
								<Episode key={episode.slug} episode={episode} podcast={podcast} />
							))}
						</div>
						: <></>}
				</>
				:
				<div>
					{playlists?.map((pl) => (
						<Playlist key={pl.slug} playlist={pl} podcast={podcast} />
					))}
				</div>
			}

		</>
	)
}