import React from "react";

import config from "../config.json"
import "./loader.css"

export default function loader(props) {
	let loading = props.loading;

	return (
		<>
			{loading ?
				<img className="loader" src={config.host + "/public/loader.gif"} alt="Chargement..."></img>
			:<></>}
		</>
	)
}