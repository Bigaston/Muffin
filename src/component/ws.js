import React, { useEffect } from "react";

import config from "../config.json";

import streamAtom from "../stores/stream";
import playerAtom from "../stores/player"
import { useRecoilState } from "recoil";

export default function WS() {
	let [, setStream] = useRecoilState(streamAtom);
	let [player, setPlayer] = useRecoilState(playerAtom)

	useEffect(() => {
		let ws = new WebSocket(config.host.replace("https", "ws").replace("http", "ws"), "live");
		ws.onopen = (event) => {
			console.log("WS: Connecté")
		}
		ws.onmessage = (event) => {
			let data = JSON.parse(event.data)
			setStream(data);

			if (data.stream === false && player.slug === "") {

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

				if (player.playerRef !== undefined) {
					player.playerRef.current.pause()
					player.playerRef.current.src = "";
				}
			}
		}
		// eslint-disable-next-line
	}, [])

	return (<></>)
}