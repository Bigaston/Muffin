import {
	atom,
} from 'recoil';

const timeState = atom({
	key: 'timeState', // unique ID (with respect to other atoms/selectors)
	default: {
		currentTime: 0
	}, // default value (aka initial value)
});

export default timeState;