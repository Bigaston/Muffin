import React from "react";

import EpisodesListItem from "./EpisodesListItem";

import "./EpisodesList.css";

const EpisodesList = ({ episodesList, setCurrentEpisode, style, themeColor }) => {
	return Array.isArray(episodesList) && episodesList.length > 0 ? (
		<div className="epList" style={style}>
			{episodesList.map((ep) => (
				<EpisodesListItem
					key={ep._id}
					episode={ep}
					setCurrentEpisode={setCurrentEpisode}
					themeColor={themeColor}
				/>
			))}
		</div>
	) : null;
};
export default EpisodesList;
