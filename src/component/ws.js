import React, { useEffect } from "react";

import config from "../config.json";

import streamAtom from "../stores/stream";
import playerAtom from "../stores/player"
import { useRecoilState } from "recoil";

export default function WS() {
	let [, setStream] = useRecoilState(streamAtom);
	let [player, setPlayer] = useRecoilState(playerAtom)

	useEffect(() => {
		let url;
		if (!!config.host) {
			url = config.host.replace("https", "wss").replace("http", "ws")
		} else {
			url = window.location.href.replace("https", "wss").replace("http", "ws")
		}
		let ws = new WebSocket(url, "live");
		ws.onopen = (event) => {
			console.log("WS: Connecté")
		}
		ws.onmessage = (event) => {
			let data = JSON.parse(event.data)
			setStream(data);

			if (data.stream === false && player.slug === "") {
				if (player.playerRef !== undefined) {
					player.playerRef.current.pause()
					player.playerRef.current.src = "";
				}

				setPlayer(current => {
					return {
						...current,
						displayed: false,
						paused: false,
						img: "",
						title: "",
						slug: "",
						duration: "",
						audio: "",
						live: false
					};
				})
			}
		}
		// eslint-disable-next-line
	}, [])

	return (<></>)
}