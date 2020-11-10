import {
    atom,
    selector,
} from 'recoil';

const playerState = atom({
    key: 'playerState', // unique ID (with respect to other atoms/selectors)
    default: {
		displayed: false,
		paused: false,
		img: "",
		title: "",
		slug: "",
		duration: "",
		audio: ""
	}, // default value (aka initial value)
});

export default playerState;