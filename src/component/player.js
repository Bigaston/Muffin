import React, {useRef, useEffect, useState} from "react";

import playerAtom from "../stores/player";
import {useRecoilState} from "recoil";

import "./player.css"
import config from "../config.json"

import {convertHMS} from "../utils"

export default function Player() {
	let [playerStore, setPlayerStore] = useRecoilState(playerAtom);
	let [currentTime, setCurrentTime] = useState("00:00:00");
	let [pourcentageProgression, setPourcentageProgression] = useState("0%")

	let audioPlayer = useRef(undefined);
	let progressbar = useRef(undefined)
	let intervalCheck = undefined

	useEffect(()=> {
		if (!playerStore.displayed) {
			return;
		}

		if (audioPlayer.current.src !== playerStore.audio) {audioPlayer.current.src = playerStore.audio;}

		if (playerStore.paused) {
			audioPlayer.current.pause()
			clearInterval(intervalCheck);
			updateTime();
		} else {
			audioPlayer.current.play()
			setInterval(updateTime, 200);
		}
	}, [playerStore, intervalCheck])

	function updateTime() {
		let durationObj = convertHMS(audioPlayer.current.currentTime);
		setCurrentTime(durationObj.heure + ":" + durationObj.minute + ":" + durationObj.seconde)

		setPourcentageProgression(Math.trunc((audioPlayer.current.currentTime/audioPlayer.current.duration)*10000)/100)
	}

	function changeTime(event) {
		let percent = event.nativeEvent.offsetX / progressbar.current.offsetWidth;
		audioPlayer.current.currentTime = percent * audioPlayer.current.duration;
	}

	function playPauseEp() {
		if (playerStore.paused) {
			let played_ep = {
				displayed: playerStore.displayed,
				paused: false,
				img: playerStore.img,
				title: playerStore.title,
				slug: playerStore.slug,
				duration: playerStore.duration,
				audio: playerStore.audio
			}

			setPlayerStore(played_ep);
		} else if (!playerStore.paused) {
			let played_ep = {
				displayed: playerStore.displayed,
				paused: true,
				img: playerStore.img,
				title: playerStore.title,
				slug: playerStore.slug,
				duration: playerStore.duration,
				audio: playerStore.audio
			}

			setPlayerStore(played_ep);
		}
	}

	function moins15() {
		audioPlayer.current.currentTime = audioPlayer.current.currentTime - 15
		updateTime();
	}

	function plus15() {
		audioPlayer.current.currentTime = audioPlayer.current.currentTime + 15
		updateTime();
	}

	return (
		<>
			<div className={"playerDiv " + (playerStore.displayed ? "opened" : "closed")}>
				<audio ref={audioPlayer} hidden></audio>
				<img src={config.host + playerStore.img} alt={"Image de " + playerStore.title} />
				<div className="rightDivPlayer">
					<p>{playerStore.title}</p>
					<div id="progressbar" ref={progressbar} onClick={changeTime}>
						<div id="prog" style={{width: pourcentageProgression + "%"}}></div>
					</div>
					<div className="time">
						<p id="audio-time">{currentTime}</p>
						<p id="audio-duration">{playerStore.duration}</p>
					</div>
					<div className="controls">
						<img src={config.host + "/public/backward.svg"} alt="-15s" onClick={moins15}/>
						<img src={playerStore.paused ? config.host + "/public/play.svg" : config.host + "/public/pause.svg"}
							alt={playerStore.paused ? "Reprendre " + playerStore.title : "Mettre en pause " + playerStore.title} 
							onClick={playPauseEp} />
						<img src={config.host + "/public/forward.svg"} alt="+15s" onClick={plus15}/>
					</div>
				</div>
			</div>
		</>

	)
}