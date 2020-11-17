import React, { useRef, useState, useEffect } from "react";

import playerStore from "../stores/player";

import { useRecoilState } from "recoil";

import EpisodesList from "./EpisodesList";

import classname from "classnames";

import PodcastTitle from "./PodcastTitle";
import EpisodeTitle from "./EpisodeTitle";
import EpisodeCover from "./EpisodeCover";

import {
	PlayerProgressBar,
	PlayerAudioTimer,
	PlayerControls,
} from "./PlayerElements";

const Player = ({
	currentEpisode,
	currentPodcast,
	episodesList,
	setCurrentEpisode,
	displayEpList,
	themeColor
}) => {
	const player = useRef();

	const [, setPlayerState] = useRecoilState(playerStore);
	const playerDiv = useRef(undefined);

	const [episodesListVisible, setEpisodesListVisible] = useState(false);

	useEffect(() => {
		window.onresize = () => {
			window.parent.postMessage({ height: playerDiv.current.offsetHeight }, "*");
		}
	}, [playerDiv?.current?.offsetHeight])

	useEffect(() => {
		window.parent.postMessage({ height: playerDiv.current.offsetHeight }, "*");
	}, [episodesListVisible])

	useEffect(() => {
		window.parent.postMessage({ height: playerDiv.current.offsetHeight }, "*");
	}, [])

	useEffect(() => {
		const ref = player.current;

		if (ref && ref.dataset.boundEvents !== "did") {
			ref.dataset.boundEvents = "did";
			(
				"loadstart progress suspend abort error " +
				"emptied stalled loadedmetadata loadeddata canplay canplaythrough " +
				"playing waiting seeking seeked ended durationchange " +
				"timeupdate play pause ratechange resize volumechange"
			)
				.split(" ")
				.forEach((ev) => {
					ref.addEventListener(ev.trim(), (e) => {
						if (e?.error) {
							console.error(e.error);
						}

						setPlayerState((playerState) => ({
							...playerState,
							hasVideo: ref.videoWidth > 0 || ref.videoHeight > 0,
							duration: ref.duration,
							currentTime: ref.currentTime,
							paused: ref.paused,
							ended: ref.ended,
							networkState: ref.networkState,
							readyState: ref.readyState,
							muted: ref.muted,
							loading: ref.networkState === 2,
							playing: !(ref.ended || ref.seeking || ref.paused),
							src: ref.src,
						}));
					});
				});

			console.log("adding funcs to playerState");
			setPlayerState((playerState) => ({
				...playerState,
				minus15: () => {
					ref.currentTime = ref.currentTime - 15;
					if (ref.paused) {
						ref.play().catch((error) => {
							ref.dispatchEvent(new ErrorEvent(error, {}));
						});
					}
				},
				plus15: () => {
					ref.currentTime = ref.currentTime + 15;
					if (ref.paused) {
						ref.play().catch((error) => {
							ref.dispatchEvent(new ErrorEvent(error, {}));
						});
					}
				},
				playPause: () => {
					const loading = ref.seeking || ref.networkState === 2;

					if (loading || (!ref.paused && !ref.ended)) {
						ref.pause();
					} else {
						ref.play().catch((error) => {
							ref.dispatchEvent(new ErrorEvent(error, {}));
						});
					}
				},
			}));
		}
	}, [player, setPlayerState]);

	useEffect(() => {
		const ref = player.current;

		if (ref) {
			const playerSrc = ref.src;
			const audioSrc = currentEpisode.enclosure_url;

			if (playerSrc !== audioSrc) {
				ref.src = audioSrc;
				if (ref.dataset.had_src_before) {
					ref.play().catch((error) => {
						debugger;
						ref.dispatchEvent(new ErrorEvent(error, {}));
					});
				} else {
					ref.dataset.had_src_before = true;
				}
			}
		}
	}, [player, currentEpisode.enclosure_url]);

	const showEpisodesList = episodesList?.loading || episodesList?.length > 0;

	return (
		<div className="player" ref={playerDiv} className={classname({ white: themeColor === "white" }, { black: themeColor === "black" })}>
			<div className="playerHead">
				<video ref={player} hidden preload="none" />
				<EpisodeCover currentEpisode={currentEpisode} />
				<div className="rightDivPlayer">
					<EpisodeTitle currentEpisode={currentEpisode} />
					<PodcastTitle
						currentEpisode={currentEpisode}
						currentPodcast={currentPodcast}
					/>
					<PlayerProgressBar playerRef={player} />
					<PlayerAudioTimer
						playerRef={player}
						initialDuration={currentEpisode.duration}
					/>
					<PlayerControls
						themeColor={themeColor}
						playerRef={player}
						episodesListLoading={episodesList?.loading}
						showEpisodesListButtonFn={
							showEpisodesList
								? () => {
									setEpisodesListVisible((current) => {
										return !current;
									});
								}
								: null
						}
						displayEpList={displayEpList}
					/>
				</div>
			</div>
			{showEpisodesList ? (
				<EpisodesList
					episodesList={episodesList}
					setCurrentEpisode={setCurrentEpisode}
					style={episodesListVisible ? {} : { display: "none" }}
					themeColor={themeColor}
				/>
			) : null}
		</div>
	);
};

export default Player;
