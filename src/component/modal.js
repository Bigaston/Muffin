import React from "react";

import "./modal.css"

export default function Modal(props) {
	function quit() {
		if (props.onCancel !== undefined) props.onCancel();
	}

	return (
		<>
			{props.open ?
				<>
					<div class="darkZone" onClick={quit}></div>
					<div class="modal">
						{props.children}
					</div>
				</>
			:<></>}
		</>
	)
}