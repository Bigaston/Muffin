import React from "react";

const EpisodeTitle = ({ currentEpisode }) => {
	const { url, title } = currentEpisode;

	return (
		<p id="eptitle">
			<a href={url} target="_parent" alt={"Ecouter " + title}>
				{title}
			</a>
		</p>
	);
};

export default EpisodeTitle;
