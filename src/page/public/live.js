import React, { useEffect, useState } from "react";

import axios from "axios";
import config from "../../config.json"
import { Link, useHistory } from "react-router-dom"
import { Helmet } from "react-helmet";

import Loader from "../../component/loader"
import ToAbout from "../../component/to_about"

import playerAtom from "../../stores/player";
import streamAtom from "../../stores/stream"
import { useRecoilState } from "recoil";


import "./episode.css";

import FullLoad from "../../component/fullLoader"
import Modal from "../../component/modal"
import Icon from "../../component/icon"
import LivePastille from "../../component/livePastille";

export default function EpisodePage() {
	let [playerStore, setPlayerStore] = useRecoilState(playerAtom);
	let [stream,] = useRecoilState(streamAtom)
	let history = useHistory();
	let [podcast, setPodcast] = useState({});
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

	const handleReturnMenu = () => {
		history.push("/")
	}

	function playPauseEp() {
		if (!playerStore.displayed || playerStore.slug !== "live") {
			let played_ep = {
				displayed: true,
				paused: false,
				img: stream.img,
				title: stream.title,
				slug: "live",
				audio: stream.url,
				live: true
			}

			setPlayerStore({ ...playerStore, ...played_ep });
			playerStore.playerRef.current.play();
		} else if (playerStore.paused) {
			let played_ep = {
				paused: false,
			}

			setPlayerStore({ ...playerStore, ...played_ep });
			playerStore.playerRef.current.play();
		} else if (!playerStore.paused) {
			let played_ep = {
				paused: true,
			}

			setPlayerStore({ ...playerStore, ...played_ep });
		}
	}

	const [modalShare, setModalShare] = useState(false);
	function shareEpisode() {
		if (window.navigator.share) {
			window.navigator.share({
				title: stream.title,
				text: "Découvrez le live " + stream.title + " de " + podcast.title,
				url: window.location.href,
			});
		} else {
			setModalShare(true)
		}
	}

	return (
		<>
			{podcast !== undefined ?
				<>
					<FullLoad loading={isLoading} />
					<img className="backToMenuImg" src={config.host + "/public/arrow-left.svg"} alt="Retourner à l'index" onClick={handleReturnMenu} />
					<div className="headerBox">
						<div className="header" style={{ backgroundImage: "url(" + config.host + (stream.img !== undefined ? stream.img : podcast.logo) + ")" }}></div>
					</div>
					<div className="hoverHeader" overflow="hidden"></div>
					<div className="hoverHeader2" overflow="hidden"></div>
					<div className="topPageEpisode">
						<img src={config.host + (stream.img !== undefined ? stream.img : podcast.logo)} alt={"Logo de " + podcast.title} />
					</div>

					<div className="content">
						{!stream.stream ?
							<>
								<Helmet>
									<title>{"Live hors ligne - " + podcast.title}</title>
									<meta property="og:title" content={"Live hors ligne - " + podcast.title}></meta>
									<meta property="og:description" content={podcast.description}></meta>
									<meta name="description" content={podcast.description}></meta>
									<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + "/img/pod.jpg"}></meta>
								</Helmet>
								<h2 className="contentHeader">Live hors ligne!</h2>
								<p>Le live que vous essayez de regarder est terminé/n'a pas encore démarré. Vous pouvez rester sur cette page qui se mettra à jour automatiquement si un live démarre, ou vous pouvez découvrir les autres épisodes du podcast!</p>
								<p className="backToMenu"><Link to="/">Retourner au menu</Link></p>
							</>
							:
							<>
								<Helmet>
									<title>{stream.title + " - " + podcast.title}</title>
									<meta property="og:title" content={stream.title + " - " + podcast.title}></meta>
									<meta property="og:description" content={stream.small_desc}></meta>
									<meta name="description" content={stream.small_desc}></meta>
									<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + stream.img}></meta>
								</Helmet>
								<h2 className="contentHeader">{stream.title} <LivePastille /></h2>
								<div className="buttonBar">
									<img src={
										playerStore.paused === false && playerStore.slug === "live" ? config.host + "/public/pause.svg" : config.host + "/public/play.svg"}
										alt={playerStore.paused === false && playerStore.slug === "live" ? "Lire " + stream.title : "Mettre en pause " + stream.title}
										onClick={playPauseEp} />
									<img src={config.host + "/public/share.svg"} alt="Partager l'épisode" onClick={shareEpisode} />
								</div>

								<div className="descriptionEp" dangerouslySetInnerHTML={{ __html: stream.description }}></div>
							</>
						}
					</div>

					<ToAbout />

					<Modal open={modalShare} onCancel={() => { setModalShare(false) }}>
						<h1>Partager le live</h1>

						<div className="iconShare">
							<Icon name="twitter" link={"https://twitter.com/intent/tweet?url=" + encodeURI(window.location.href) + "&text=" + encodeURI(stream.title + " - " + podcast.title)} />
							<Icon name="facebook" link={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(window.location.href)} />
						</div>
					</Modal>
				</>
				: <Loader />}
		</>
	)
}