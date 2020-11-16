import React from "react";

import "./EpisodesListItem.css";

import playerStore from "../../stores/player";
import { useRecoilState } from "recoil";

import { convertHMS } from "../../utils";

import config from "../../config.json";

const EpisodesListItem = ({ episode, setCurrentEpisode }) => {
	const [playerState] = useRecoilState(playerStore);

	const { src: playerSrc, playing, playPause } = playerState;

	const currently_me = episode.enclosure_url === playerSrc;

	function playPauseMe() {
		if (currently_me) {
			playPause();
		} else {
			setCurrentEpisode(episode);
		}
	}

	return (
		<div className="oneEpisode">
			<img
				onClick={playPauseMe}
				src={currently_me && playing ? config.host_assets + "/pause.svg" : config.host_assets + "/play.svg"}
				alt={currently_me && playing ? "Mettre en pause" : "Reprendre"}
			/>
			<p className="OneEpTitle">{episode.title}</p>
			<p className="OneEpDuration">{convertHMS(episode.enclosure_duration)}</p>
		</div>
	);
};

export default EpisodesListItem;
