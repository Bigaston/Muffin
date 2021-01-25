import React from "react";

import "./episode.css";
import config from "../config.json"
import { Link } from "react-router-dom"

import playerAtom from "../stores/player";
import { useRecoilState } from "recoil";
import LivePastille from "./livePastille";

import { useDarkTheme } from "../utils"

export default function Episode(props) {
	let [playerStore, setPlayerStore] = useRecoilState(playerAtom);

	const { theme } = useDarkTheme();

	let episode = props.episode;
	let podcast = props.podcast;

	let month_tab = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

	let pub_date = new Date(episode.pub_date);
	let pub_date_string = "Publié le " + pub_date.getDate() === 1 ? "1er" : pub_date.getDate() + " " + month_tab[pub_date.getMonth()] + " " + pub_date.getFullYear()

	function playPauseEp() {
		if (!playerStore.displayed || playerStore.slug !== episode.slug) {
			setPlayerStore(current => {
				return {
					...current,
					displayed: true,
					paused: false,
					img: episode.img,
					title: episode.title,
					slug: episode.slug,
					duration: episode.duration,
					audio: episode.audio,
					live: props.live
				};
			})
			playerStore.playerRef.current.play();
		} else if (playerStore.paused) {
			setPlayerStore(current => {
				return {
					...current,
					paused: false,
				};
			})
			playerStore.playerRef.current.play();
		} else if (!playerStore.paused) {
			setPlayerStore(current => {
				return {
					...current,
					paused: true,
				};
			})
		}
	}

	return (
		<div className="episode">
			<img src={episode.img !== undefined ? config.host + episode.img : config.host + podcast.logo} alt={"Couverture de " + episode.title} />
			<div className="rightDivEp">
				<div className="divTitle">
					<img src={
						playerStore.paused === false && playerStore.slug === episode.slug ? config.host + "/public/" + theme + "/pause.svg" : config.host + "/public/" + theme + "/play.svg"}
						alt={playerStore.paused === false && playerStore.slug === episode.slug ? "Lire " + episode.title : "Mettre en pause " + episode.title}
						onClick={playPauseEp} />
					<h2><Link to={"/" + episode.slug}>{episode.title}</Link></h2>
					{props.live !== undefined ? <LivePastille /> : null}
				</div>

				<p className="desc">{episode.small_desc}</p>
				{props.live !== undefined ? null :
					<p className="moreInfoEp">{episode.duration} | {pub_date_string}</p>
				}
			</div>
		</div>
	)
}