import React, { useEffect, useState, useRef } from "react";

import axios from "axios";
import config from "../../config.json"
import { Link, useHistory } from "react-router-dom"
import { Helmet } from "react-helmet";

import classnames from "classnames";

import Toastify from 'toastify-js'

import Loader from "../../component/loader"
import ToAbout from "../../component/to_about"

import { useParams } from "react-router-dom";

import playerAtom from "../../stores/player";
import timeAtom from "../../stores/currentTime"
import { useRecoilState } from "recoil";

import { srt } from "../../utils";

import "./episode.css";

import FullLoad from "../../component/fullLoader"
import Modal from "../../component/modal"
import Icon from "../../component/icon"
import ReactionBar from "../../component/reaction_bar"

export default function EpisodePage() {
	let [playerStore, setPlayerStore] = useRecoilState(playerAtom);
	let [timeStore, setTimeStore] = useRecoilState(timeAtom)
	let history = useHistory();
	let { slug } = useParams();
	let [episode, setEpisode] = useState({});
	let [podcast, setPodcast] = useState({});
	let [isNotFound, setIsNotFound] = useState(false);
	let [pubDateString, setPubDateString] = useState("");
	let [isLoading, setIsLoading] = useState(true);
	const [currentTab, setCurrentTab] = useState("description");
	const [transcriptTime, setTranscriptTime] = useState([]);

	useEffect(() => {
		let month_tab = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

		axios({
			method: "GET",
			url: config.host + "/api/podcast/get_ep_info/" + slug
		}).then(res => {
			if (res.data.episode !== undefined) {
				setEpisode(res.data.episode)
				setPodcast(res.data.podcast)

				let pub_date = new Date(res.data.episode.pub_date);
				setPubDateString("Publié le " + pub_date.getDate() === 1 ? "1er" : pub_date.getDate() + " " + month_tab[pub_date.getMonth()] + " " + pub_date.getFullYear())

				if (!!res.data.episode.transcript_file) {
					axios({
						method: "GET",
						url: config.host + res.data.episode.transcript_file
					}).then(res => {
						setTranscriptTime(srt(res.data))
					}).catch(err => {
						console.log(err);
					})
				}

				setInterval(() => {
					setIsLoading(false)
				}, 200)
			} else {
				setPodcast(res.data.podcast);
				setIsNotFound(true);
				setInterval(() => {
					setIsLoading(false)
				}, 200)
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

	function downloadEp() {
		window.open(config.host + episode.audio)
	}

	const [modalShare, setModalShare] = useState(false);
	function shareEpisode() {
		if (window.navigator.share) {
			window.navigator.share({
				title: episode.title,
				text: "Découvrez l'épisode " + episode.title + " de " + podcast.title,
				url: window.location.href,
			});
		} else {
			setModalShare(true)
		}
	}

	// Génération du widget
	const [modalEmbed, setModalEmbed] = useState(false)

	const [selectedTheme, setSelectedTheme] = useState("white")
	const [displayEpList, setDisplayEpList] = useState(true);
	const [playerString, setPlayerString] = useState("");
	const divResult = useRef();
	const inputResult = useRef();

	function generatePlayer() {
		let host = window.location.protocol + "//" + window.location.hostname

		if (!!window.location.port) { host = host + ":" + window.location.port }
		const chaine = `<iframe src="${host}/player/${episode.slug}?theme=${selectedTheme}${!displayEpList ? "&hide_list=" : ""}" width="100%" style="border: none;" id="muffin_player_div"></iframe><script src="${host}/public/player.js"></script>`

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

	function jumpTime(t) {
		playerStore.playerRef.current.currentTime = t.start_seconds;
		setTimeStore({ currentTime: t.start_seconds })
	}

	return (
		<>
			{podcast !== undefined ?
				<>
					<FullLoad loading={isLoading} />
					<img className="backToMenuImg" src={config.host + "/public/arrow-left.svg"} alt="Retourner à l'index" onClick={handleReturnMenu} />
					<div className="headerBox">
						<div className="header" style={{ backgroundImage: "url(" + config.host + (episode.img !== undefined ? episode.img : podcast.logo) + ")" }}></div>
					</div>
					<div className="hoverHeader" overflow="hidden"></div>
					<div className="hoverHeader2" overflow="hidden"></div>
					<div className="topPageEpisode">
						<img src={config.host + (episode.img !== undefined ? episode.img : podcast.logo)} alt={"Logo de " + podcast.title} />
					</div>

					<div className="content">
						{isNotFound ?
							<>
								<Helmet>
									<title>{"Episode non trouvé - " + podcast.title}</title>
									<meta property="og:title" content={"Episode non trouvé - " + podcast.title}></meta>
									<meta property="og:description" content={podcast.description}></meta>
									<meta name="description" content={podcast.description}></meta>
									<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + "/img/pod.jpg"}></meta>
								</Helmet>
								<h2 className="contentHeader">Cet épisode n'existe pas :/</h2>
								<p className="backToMenu"><Link to="/">Retourner au menu</Link></p>
							</>
							:
							<>
								<Helmet>
									<title>{episode.title + " - " + podcast.title}</title>
									<meta property="og:title" content={episode.title + " - " + podcast.title}></meta>
									<meta property="og:description" content={episode.small_desc}></meta>
									<meta name="description" content={episode.small_desc}></meta>
									<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + episode.img}></meta>
								</Helmet>
								<h2 className="contentHeader">{episode.title}</h2>
								<div className="buttonBar">
									<img src={
										playerStore.paused === false && playerStore.slug === episode.slug ? config.host + "/public/pause.svg" : config.host + "/public/play.svg"}
										alt={playerStore.paused === false && playerStore.slug === episode.slug ? "Lire " + episode.title : "Mettre en pause " + episode.title}
										onClick={playPauseEp} />
									<img src={config.host + "/public/download.svg"} alt="Télécharger l'épisode" onClick={downloadEp} />
									<img src={config.host + "/public/share.svg"} alt="Partager l'épisode" onClick={shareEpisode} />
								</div>

								{!!episode.transcript || !!episode.transcript_file ?
									<>
										<div className="nav">
											<p className={classnames({ current: currentTab === "description" })} onClick={() => { setCurrentTab("description") }}>Description</p>
											{!!episode.transcript ? <p className={classnames({ current: currentTab === "transcript" })} onClick={() => { setCurrentTab("transcript") }}>Transcript</p> : null}
											{!!episode.transcript_file ? <p className={classnames({ current: currentTab === "transcript_file" })} onClick={() => { setCurrentTab("transcript_file") }}>Transcript avancé</p> : null}
										</div>
									</>
									: null}

								{currentTab === "description" ?
									<div className="descriptionEp" dangerouslySetInnerHTML={{ __html: episode.description }}></div>
									: null}

								{currentTab === "transcript" ?
									<div className="descriptionEp">{episode.transcript.split("\n").map((p, i) => (<p key={i}>{p}</p>))}</div>
									: null}

								{currentTab === "transcript_file" ?
									<>
										{transcriptTime.map(t => (
											<div onClick={() => { jumpTime(t) }} className={classnames("sub", { "subcurrent": playerStore.slug === slug && timeStore.currentTime >= t.start_seconds && timeStore.currentTime < t.end_seconds }, { "hoverable": playerStore.slug === slug })} key={t.id}>
												<p className="timeSub">{t.start_text}</p>
												<p className="textSub">{t.text}</p>
											</div>
										))}
									</>
									: null}
								<p className="moreInfoEp">Publié le {pubDateString} - <span onClick={() => { setModalEmbed(true) }} className="openEmbed">Intégrer l'épisode</span></p>
							</>
						}
					</div>

					{!isNotFound ?
						<ReactionBar slug={slug} />
						: null}

					<ToAbout />

					<Modal open={modalShare} onCancel={() => { setModalShare(false) }}>
						<h1>Partager l'épisode</h1>

						<div className="iconShare">
							<Icon name="twitter" link={"https://twitter.com/intent/tweet?url=" + encodeURI(window.location.href) + "&text=" + encodeURI(episode.title + " - " + podcast.title)} />
							<Icon name="facebook" link={"https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(window.location.href)} />
						</div>
					</Modal>

					<Modal open={modalEmbed} onCancel={() => { setModalEmbed(false) }}>
						<h2>Intégrer l'épisode</h2>
						<p>Ici vous pourrez générer un player de podcast que vous pourrez intégrer sur d'autres sites internets. Le player va automatiquement s'adapter à la largeur qu'il dispose.</p>
						<p>Si il a plus que 490px de large, il sera au format horizontal, si il a moins, il sera au format vertical.</p>
						<p>Vous pouvez définir vous mêmes la largeur du player, ou alors la laisser à 100% et laisser le script joint. Celui-ci permet de modifier la hauteur de l'intégration en fonction du format, automatiquement.</p>
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
					</Modal>
				</>
				: <Loader />}
		</>
	)
}