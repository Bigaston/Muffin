import React from "react";

import iconlist from "./icon.json"
import config from "../config.json"
import "./icon.css"

export default function Icon({ name, link }) {
	let me = iconlist[name]

	return (
		<>
			{!!link ?
				<div class="icon" style={{ backgroundColor: me.color }} onClick={() => { window.open(link) }}>
					<img src={config.host + "/public/logo/" + me.img} alt={me.alt}></img>
				</div>
				:
				<></>}
		</>

	)
}