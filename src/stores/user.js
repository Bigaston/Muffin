import {
    atom,
} from 'recoil';

const userState = atom({
    key: 'userState', // unique ID (with respect to other atoms/selectors)
    default: {
		made_verification: false,
		logged: false,
		username: "",
		id: 0,
		jwt: ""
	}, // default value (aka initial value)
});

export default userState;