import React from "react";

import "./episode.css";
import config from "../config.json"
import {Link} from "react-router-dom"

export default function Episode(props) {
	let episode = props.episode;
	let podcast = props.podcast;

	let month_tab = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

	let pub_date = new Date(episode.pub_date);
	let pub_date_string = "Publié le " + pub_date.getDate() === 1 ? "1er" : pub_date.getDate() + " " + month_tab[pub_date.getMonth()] + " " + pub_date.getFullYear()

	return (
		<div className="episode">
			<img src={episode.img !== undefined ? config.host + episode.img : config.host + podcast.logo} alt={"Couverture de " + episode.title} />
			<div className="rightDivEp">
				<h2><Link to={"/" + episode.slug}>{episode.title}</Link></h2>
				<p className="desc">{episode.small_desc}</p>
				<p className="moreInfoEp">{episode.duration} | {pub_date_string}</p>
			</div>
		</div>
	)
}