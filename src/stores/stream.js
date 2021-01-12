import {
	atom,
} from 'recoil';

const userState = atom({
	key: 'streamState', // unique ID (with respect to other atoms/selectors)
	default: {
		stream: false
	}
});

export default userState;