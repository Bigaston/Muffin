import { atom } from "recoil";

const playerState = atom({
  key: "player",
  default: {
    hasVideo: false,
    duration: 0,
    currentTime: 0,
    paused: true,
    ended: false,
    networkState: false,
    readyState: false,
    muted: false,
    loading: false,
    playing: false,
    src: null,
    minus15: () => console.log("No player ref yet"),
    plus15: () => console.log("No player ref yet"),
    playPause: () => console.log("No player ref yet"),
  },
});

export default playerState;
