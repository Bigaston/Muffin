import React from "react";

import "./fullLoader.css"

import config from "../config.json"

export default function FullLoader({ loading }) {
	return (
		<>
			{loading ?
				<div class="fullLoad">
					<img src={config.host + "/public/loader.gif"} alt="Chargement..."></img>
				</div>
				: <></>}
		</>

	)
}