import React, { useEffect, useState } from "react";

import axios from "axios";
import config from "../../config.json"

import classnames from "classnames";

import Episode from "../../component/episode";
import FullLoad from "../../component/fullLoader";
import Icon from "../../component/icon"
import IconDonation from "../../component/icon_donation"
import ToAbout from "../../component/to_about"
import SubscribeButton from "../../component/subscribe_btn"

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
				<Icon name="rss" link={config.host + "/rss"} />
				<Icon name="apple_podcast" link={podcast.data?.apple_podcast} />
				<Icon name="spotify" link={podcast.data?.spotify} />
				<Icon name="google_podcast" link={podcast.data?.google_podcast} />
				<Icon name="deezer" link={podcast.data?.deezer} />
				<Icon name="podcloud" link={podcast.data?.podcloud} />
				<Icon name="podcast_addict" link={podcast.data?.podcast_addict} />
				<Icon name="youtube" link={podcast.data?.youtube} />
				<Icon name="twitter" link={podcast.data?.twitter} />
				<Icon name="instagram" link={podcast.data?.twitter} />
				<IconDonation link={podcast.data?.donation} />
			</div>

			<SubscribeButton />

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

			<ToAbout />
		</>
	)
}