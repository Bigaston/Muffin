import React, { useRef } from "react";

import playerStore from "../../stores/player";
import { useRecoilState } from "recoil";

const PlayerProgressBar = ({ playerRef }) => {
	const [playerState] = useRecoilState(playerStore);

	const progressbarRef = useRef();

	const { currentTime, duration } = playerState;

	const percent =
		Math.trunc(((currentTime || 0) / (duration || 1)) * 10000) / 100;

	function updateTime(event) {
		if (playerRef.current && event.target === progressbarRef.current) {
			const percent = event.nativeEvent.offsetX / event.target.offsetWidth;
			const player = playerRef.current;
			const jump = () => {
				player.currentTime = percent * player.duration;
				console.log(
					"jump to " + percent.toFixed(2) + " : " + player.currentTime
				);
			};

			if (player.readyState === 1) {
				jump();
			} else {
				player.play().then(() => {
					player.pause();
					jump();
				})
			}
		} else {
			debugger;
		}
	}

	return (
		<div id="progressbar" ref={progressbarRef} onClick={updateTime}>
			<div
				id="prog"
				style={{ width: percent + "%", pointerEvents: "none" }}
			></div>
		</div>
	);
};

export default PlayerProgressBar;
