import React from "react";

import config from "../config.json"

const PodcastTitle = ({ currentEpisode, currentPodcast }) => {
	const { enclosure_url } = currentEpisode;

	const { url, title } = currentPodcast;

	return (
		<p id="podtitle">
			<a href={url} target="_parent" alt={"Découvrir le podcast " + title}>
				{title}
			</a>{" "}
			<a href={enclosure_url} target="_parent" alt="Télécharger">
				<img id="download" src={config.host_assets + "/download.svg"} alt="Télécharger" />
			</a>
		</p>
	);
};

export default PodcastTitle;
