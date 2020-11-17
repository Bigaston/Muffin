import axios from "axios";
import config from "../config.json"
import React, { useEffect, useState } from "react";

import { toSeconds } from "../utils"

import FullLoader from "./fullLoader"

const MuffinLoader = ({ guid, PlayerComponent }) => {
	const [currentEpisode, setCurrentEpisode] = useState();
	const [currentPodcast, setCurrentPodcast] = useState();
	const [episodesList, setEpisodeList] = useState();
	const [loading, setLoading] = useState(true);
	const [displayEpList, setDisplayEpList] = useState(true);
	const [themeColor, setThemeColor] = useState("white");

	useEffect(() => {
		const url = window.location.pathname.split("/");
		const slug = url[url.length - 1];

		const urlParams = new URLSearchParams(window.location.search);

		if (urlParams.get("hide_list") !== null) { setDisplayEpList(false) }
		if (urlParams.get("theme") !== null) {
			if (urlParams.get("theme") === "white") {
				setThemeColor("white")
			} else if (urlParams.get("theme") === "black") {
				setThemeColor("black")
			} else {
				setThemeColor("white")
			}
		}

		axios({
			method: "GET",
			url: config.host + "/api/player/episode/" + slug
		}).then(res => {
			if (res.status === 200) {
				setCurrentEpisode({
					_id: res.data.episode.slug,
					cover: { medium_url: config.host + res.data.episode.img },
					enclosure_duration: toSeconds(res.data.episode.duration),
					enclosure_url: config.host + res.data.episode.enclosure,
					title: res.data.episode.title,
					url: config.host + "/" + res.data.episode.slug
				});
				setCurrentPodcast({
					title: res.data.podcast.title,
					url: config.host,
					website_url: config.host
				});

				let list = [];
				res.data.episode_list.forEach(ep => {
					let ep_obj = {
						_id: ep.slug,
						cover: { medium_url: config.host + ep.img },
						enclosure_duration: toSeconds(ep.duration),
						enclosure_url: config.host + ep.enclosure,
						title: ep.title,
						url: config.host + "/" + ep.slug
					}

					list.push(ep_obj)
				})
				setEpisodeList(list);

				setInterval(() => {
					setLoading(false);

				}, 200)
			}
		}).catch(err => {
			console.log(err);
		})
	}, []);

	return (
		<>
			<FullLoader loading={loading} />

			{loading ? <></>
				:
				<PlayerComponent
					currentEpisode={currentEpisode}
					currentPodcast={currentPodcast}
					episodesList={episodesList}
					setCurrentEpisode={setCurrentEpisode}
					displayEpList={displayEpList}
					themeColor={themeColor}
				/>
			}
		</>
	)
};

export default MuffinLoader;
