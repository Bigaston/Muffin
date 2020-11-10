import React from "react";

import userAtom from "../stores/user";
import {useRecoilState} from "recoil";

import FullLoader from "./fullLoader"

import {useHistory} from "react-router-dom";

export default function CheckLogged(props) {
	let history = useHistory();
	let [userState, ] = useRecoilState(userAtom);

	return (
		<>
			{userState.made_verification ?
				<>
				{userState.logged ?
					<>
						{props.children}
					</>
				: 
					<>{history.push("/a/login")}</>}
				</>
			:
				<FullLoader />
			}

		</>
	)
}