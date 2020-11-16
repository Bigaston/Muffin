import React from "react";

import { convertHMS } from "../../utils";

import playerStore from "../../stores/player";
import { useRecoilState } from "recoil";

const PlayerAudioTimer = ({ playerRef, initialDuration = 0 }) => {
  const [playerState] = useRecoilState(playerStore);

  const {
    currentTime, duration
  } = playerState;

  return (
    <div className="time">
      <p id="audio-time">{convertHMS(currentTime || 0)}</p>
      <p id="audio-duration">{convertHMS(duration || initialDuration)}</p>
    </div>
  );
};
export default PlayerAudioTimer;
