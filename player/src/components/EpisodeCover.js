import React from "react";
const EpisodeCover = ({ currentEpisode }) => {
  return (
    <img
      src={currentEpisode.cover.medium_url}
      alt={`Pochette de ${currentEpisode.title}`}
    />
  );
};

export default EpisodeCover;
