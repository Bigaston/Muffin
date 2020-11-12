import React, { useEffect, useState } from "react";


import "./fullLoader.css"

import config from "../config.json"

export default function FullLoader({ loading }) {
	let [classList, setClassList] = useState("fullLoad");
	let [isHere, setIsHere] = useState(true)

	useEffect(() => {
		if (!loading) {
			setClassList("fullLoad fadeOut")
			setInterval(() => {
				setClassList("fullLoad");
				setIsHere(false);
			}, 550)
		}
	}, [loading])

	return (
		<>
			{isHere ?
				<div className={classList}>
					<img src={config.host + "/public/loader.gif"} alt="Chargement..."></img>
				</div>
				: <></>}

		</>
	)
}