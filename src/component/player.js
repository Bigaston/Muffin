import React, { useRef, useEffect, useState } from "react";

import playerAtom from "../stores/player";
import { useRecoilState } from "recoil";

import "./player.css"
import config from "../config.json"
import axios from "axios";

import { convertHMS } from "../utils"

export default function Player() {
	let [playerStore, setPlayerStore] = useRecoilState(playerAtom);
	let [currentTime, setCurrentTime] = useState("00:00:00");
	let [pourcentageProgression, setPourcentageProgression] = useState("0%")
	let [podcast, setPodcast] = useState({});
	const [episodes, setEpisodes] = useState([]);

	let audioPlayer = useRef(undefined);
	let progressbar = useRef(undefined)
	let intervalCheck = undefined

	useEffect(() => {
		if (!playerStore.displayed) {
			return;
		}

		if (audioPlayer.current.src !== playerStore.audio) { audioPlayer.current.src = playerStore.audio; }

		if (playerStore.paused) {
			audioPlayer.current.pause()
			clearInterval(intervalCheck);
			updateTime();
		} else {
			audioPlayer.current.play()
			setInterval(updateTime, 200);
		}
	}, [playerStore, intervalCheck])

	useEffect(() => {
		axios({
			method: "GET",
			url: config.host + "/api/podcast/get_info"
		}).then(res => {
			if (res.status === 200) {
				setPodcast(res.data);
				setEpisodes(res.data.episodes);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [])

	useEffect(() => {
		setPlayerStore(current => {
			return {
				...current,
				playerRef: audioPlayer,
			};
		})
	}, [audioPlayer, setPlayerStore])

	useEffect(() => {
		if ('mediaSession' in navigator) {
			if (playerStore.displayed) {
				const img = new Image();
				img.onload = function () {
					/* eslint-disable no-undef */
					navigator.mediaSession.metadata = new MediaMetadata({
						title: playerStore.title,
						artist: podcast.author,
						album: podcast.title,
						artwork: [
							{ src: config.host + playerStore.img, sizes: this.width + 'x' + this.height, type: 'image/jpg' },
						]
					});
					/* eslint-enable no-undef */
				}
				img.src = config.host + playerStore.img;
			}
		}
	}, [playerStore, podcast])

	useEffect(() => {
		if ('mediaSession' in navigator) {
			navigator.mediaSession.setActionHandler('play', function () {
				setPlayerStore(current => {
					return { ...current, paused: false };
				})

				audioPlayer.current.play();
			});
			navigator.mediaSession.setActionHandler('pause', function () {
				setPlayerStore(current => {
					return { ...current, paused: true };
				})
			});
			navigator.mediaSession.setActionHandler('seekbackward', function () {
				audioPlayer.current.currentTime = audioPlayer.current.currentTime - 15
				updateTime();
			});
			navigator.mediaSession.setActionHandler('seekforward', function () {
				audioPlayer.current.currentTime = audioPlayer.current.currentTime + 15
				updateTime();
			});
			navigator.mediaSession.setActionHandler('stop', function () {
				audioPlayer.current.pause()
				audioPlayer.current.src = ""

				setPlayerStore(current => {
					return {
						...current,
						displayed: false,
						paused: false,
						img: "",
						title: "",
						slug: "",
						duration: "",
						audio: ""
					};
				})
			});
			navigator.mediaSession.setActionHandler('previoustrack', function () {
				for (let i = 0; i < episodes.length; i++) {
					if (episodes[i].slug === playerStore.slug && i !== 0) {
						let ep = episodes[i - 1];
						setPlayerStore(current => {
							return {
								...current,
								displayed: true,
								paused: false,
								img: ep.img,
								title: ep.title,
								slug: ep.slug,
								duration: ep.duration,
								audio: ep.audio
							};
						})

						audioPlayer.current.play();
					}
				}
			});
			navigator.mediaSession.setActionHandler('nexttrack', function () {
				for (let i = 0; i < episodes.length; i++) {
					if (episodes[i].slug === playerStore.slug && i !== episodes.length - 1) {
						let ep = episodes[i + 1];
						setPlayerStore(current => {
							return {
								...current,
								displayed: true,
								paused: false,
								img: ep.img,
								title: ep.title,
								slug: ep.slug,
								duration: ep.duration,
								audio: ep.audio
							};
						})

						audioPlayer.current.play();
					}
				}
			});
		}
	}, [playerStore, episodes, setPlayerStore])

	function updateTime() {
		let durationObj = convertHMS(audioPlayer.current.currentTime);
		setCurrentTime(durationObj.heure + ":" + durationObj.minute + ":" + durationObj.seconde)

		setPourcentageProgression(Math.trunc((audioPlayer.current.currentTime / audioPlayer.current.duration) * 10000) / 100)
	}

	function changeTime(event) {
		let percent = event.nativeEvent.offsetX / progressbar.current.offsetWidth;
		audioPlayer.current.currentTime = percent * audioPlayer.current.duration;
	}

	function playPauseEp() {
		if (playerStore.paused) {
			setPlayerStore(current => {
				return {
					...current,
					paused: false,
				};
			})

			audioPlayer.current.play();
		} else if (!playerStore.paused) {
			setPlayerStore(current => {
				return {
					...current,
					paused: true,
				};
			})
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

	function episodeBefore() {
		for (let i = 0; i < episodes.length; i++) {
			if (episodes[i].slug === playerStore.slug && i !== 0) {
				let ep = episodes[i - 1];
				setPlayerStore(current => {
					return {
						...current,
						displayed: true,
						paused: false,
						img: ep.img,
						title: ep.title,
						slug: ep.slug,
						duration: ep.duration,
						audio: ep.audio
					};
				})

				audioPlayer.current.play();
			}
		}
	}

	function episodeAfter() {
		for (let i = 0; i < episodes.length; i++) {
			if (episodes[i].slug === playerStore.slug && i !== episodes.length - 1) {
				let ep = episodes[i + 1];
				setPlayerStore(current => {
					return {
						...current,
						displayed: true,
						paused: false,
						img: ep.img,
						title: ep.title,
						slug: ep.slug,
						duration: ep.duration,
						audio: ep.audio
					};
				})

				audioPlayer.current.play();
			}
		}
	}

	function stopPlay() {
		setPlayerStore(current => {
			return {
				...current,
				displayed: false,
				paused: false,
				img: "",
				title: "",
				slug: "",
				duration: "",
				audio: ""
			};
		})

		audioPlayer.current.pause()
		audioPlayer.current.src = ""
	}

	return (
		<>
			<div className={"playerDiv " + (playerStore.displayed ? "opened" : "closed")}>
				<audio ref={audioPlayer} hidden></audio>
				<img src={config.host + playerStore.img} alt={"Image de " + playerStore.title} />
				<div className="rightDivPlayer">
					<p>{playerStore.title}</p>
					<div id="progressbar" ref={progressbar} onClick={changeTime}>
						<div id="prog" style={{ width: pourcentageProgression + "%" }}></div>
					</div>
					<div className="time">
						<p id="audio-time">{currentTime}</p>
						<p id="audio-duration">{playerStore.duration}</p>
					</div>
					<div className="controls">
						<img src={config.host + "/public/before.svg"} alt="Episode précédent" onClick={episodeBefore} />
						<img src={config.host + "/public/backward.svg"} alt="-15s" onClick={moins15} />
						<img id="playButton" src={playerStore.paused ? config.host + "/public/play.svg" : config.host + "/public/pause.svg"}
							alt={playerStore.paused ? "Reprendre " + playerStore.title : "Mettre en pause " + playerStore.title}
							onClick={playPauseEp} />
						<img src={config.host + "/public/forward.svg"} alt="+15s" onClick={plus15} />
						<img src={config.host + "/public/after.svg"} alt="Episode suivant" onClick={episodeAfter} />
						<img src={config.host + "/public/stop.svg"} alt="Arrêter" onClick={stopPlay} />
					</div>
				</div>
			</div>
		</>

	)
}