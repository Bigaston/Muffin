import React from "react";

import "./MuffinPlayer.css";

import MuffinLoader from "./MuffinLoader";
import Player from "../components/Player";

const PodcloudPlayer = () => {
	// get guid or feed_id from url

	return (
		<MuffinLoader
			PlayerComponent={Player}
		/>
	);
};

export default PodcloudPlayer;
