import React, { useEffect } from "react";

import "./menu.css";

import userAtom from "../stores/user";
import { useRecoilState } from "recoil";

import axios from "axios";
import config from "../config.json"

import { Link } from "react-router-dom"

export default function Menu() {
	let [userState, setUserState] = useRecoilState(userAtom);

	useEffect(() => {
		if (!!localStorage.getItem("jwt")) {
			axios({
				method: "POST",
				url: config.host + "/api/user/whoami",
				data: {
					jwt: localStorage.getItem("jwt")
				}
			}).then(res => {
				if (res.status === 200) {
					let new_user = {
						made_verification: true,
						logged: true,
						username: res.data.username,
						id: res.data.id,
						jwt: res.data.jwt
					}

					setUserState(new_user)
					localStorage.setItem("jwt", res.data.jwt);
				}
			}).catch(err => {
				let new_user = {
					made_verification: true,
					logged: false,
					username: "",
					id: 0,
					jwt: ""
				}

				setUserState(new_user)
				localStorage.setItem("jwt", undefined)
			})
		} else {
			return;
		}
	}, [setUserState])

	return (
		<>
			{userState.logged ?
				<div className="menu">
					<a href="https://muffin.pm" alt="Vers le site de muffin" target="_blank" rel="noreferrer"><img src={config.host + "/public/logo_small.png"} alt="Logo de Muffin" /></a>
					<p><Link to="/">Mon podcast</Link></p>
					<p><Link to="/a/podcast">Modifier mon podcast</Link></p>
					<p><Link to="/a/episodes">Mes épisodes</Link></p>
					<p><Link to="/a/new_episode">Créer un épisode</Link></p>
					<p><Link to="/a/playlists">Mes playlists</Link></p>
					<p><Link to="/a/widget">Intégration</Link></p>
					<p><Link to="/a/account">Mon compte</Link></p>
				</div>
				: <></>
			}

		</>

	)
}