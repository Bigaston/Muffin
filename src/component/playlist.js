import React from "react";

import "./playlist.css";
import config from "../config.json"
import { Link } from "react-router-dom"

export default function Playlist({ playlist, podcast }) {
	return (
		<div className="playlist">
			<img src={playlist.img !== undefined ? config.host + playlist.img : config.host + podcast.logo} alt={"Couverture de " + playlist.title} />
			<div className="rightDivEp">
				<div className="divTitle">
					<h2><Link to={"/p/" + playlist.slug}>{playlist.title}</Link></h2>
				</div>

				<p className="desc">{playlist.description}</p>
			</div>
		</div>
	)
}