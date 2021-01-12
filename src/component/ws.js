import React, { useEffect } from "react";

import config from "../config.json";

import streamAtom from "../stores/stream";
import { useRecoilState } from "recoil";

export default function WS() {
	let [, setStream] = useRecoilState(streamAtom);

	useEffect(() => {
		let ws = new WebSocket(config.host.replace("https", "ws").replace("http", "ws"), "live");
		ws.onopen = (event) => {
			console.log("WS: Connecté")
		}
		ws.onmessage = (event) => {
			setStream(JSON.parse(event.data));
		}
	})

	return (<></>)
}