import React from "react";

import "./modal.css"
import config from "../config.json"

export default function Modal(props) {
	function quit() {
		if (props.onCancel !== undefined) props.onCancel();
	}

	return (
		<>
			{props.open ?
				<>
					<div className="darkZone" onClick={quit}></div>
					<div className="modal">
						<img class="closeModal" src={config.host + "/public/close.svg"} onClick={quit} />
						{props.children}
					</div>
				</>
				: <></>}
		</>
	)
}