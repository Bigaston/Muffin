import React, { useState } from "react";

import './edit_me.css'

import axios from "axios";
import config from "../../config.json"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { Helmet } from "react-helmet";

export default function ImportPodcast() {
	let [userState, setUserState] = useRecoilState(userAtom);
	let [username, setUsername] = useState(userState.username);
	let [password, setPassword] = useState("");
	let [new_pass, setNewPass] = useState("");
	let [repeat_new_pass, setRepeatNewPass] = useState("");
	let [errorMessagePass, setErrorMessagePass] = useState("")

	function changeUsername() {
		if (!username) {
			return;
		}

		axios({
			method: "POST",
			url: config.host + "/api/admin/user/change_username",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			data: {
				username: username
			}
		}).then(res => {
			if (res.status === 200) {
				let new_user = { ...userState }
				new_user.username = username;

				setUserState(new_user);
				alert("Nom d'utilisateur modifié!")
			}
		}).catch(err => {
			console.log(err)
		})
	}

	function changePassword() {
		if (!password || !new_pass || !repeat_new_pass) {
			setErrorMessagePass("Merci de complêter les 3 champs!")
			return;
		}

		if (new_pass !== repeat_new_pass) {
			setErrorMessagePass("Les deux mots de passes ne sont pas identiques")
			return;
		}

		setErrorMessagePass("");

		axios({
			method: "POST",
			url: config.host + "/api/admin/user/change_password",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			data: {
				password: password,
				new_pass: new_pass,
				repeat_new_pass: repeat_new_pass
			}
		}).then(res => {
			if (res.status === 200) {
				localStorage.setItem("jwt", undefined);
				window.location.reload()
			}
		}).catch(err => {
			console.log(err)
		})
	}

	return (
		<>
			<Helmet>
				<title>Mon compte - Muffin</title>
			</Helmet>
			<div className="editMe">
				<h1>Modifier mon compte</h1>

				<label htmlFor="username">Nouveau nom d'utilisateur</label>
				<input className="u-full-width" type="url" id="username" value={username} onChange={(event) => { setUsername(event.target.value) }} />
				<button className="button-primary" onClick={changeUsername}>Changer mon nom d'utilisateur</button>

				<hr />
				<label htmlFor="password">Mot de passe actuel</label>
				<input className="u-full-width" type="password" id="password" value={password} onChange={(event) => { setPassword(event.target.value) }} />
				<label htmlFor="new_pass">Nouveau mot de passe</label>
				<input className="u-full-width" type="password" id="new_pass" value={new_pass} onChange={(event) => { setNewPass(event.target.value) }} />
				<label htmlFor="repeat_new_pass">Répétez le nouveau mot de passe</label>
				<input className="u-full-width" type="password" id="repeat_new_pass" value={repeat_new_pass} onChange={(event) => { setRepeatNewPass(event.target.value) }} />
				{!!errorMessagePass ? <p className="errorMessage">{errorMessagePass}</p> : <></>}
				<button className="button-primary" onClick={changePassword}>Changer mon mot de passe</button>
			</div>
		</>
	)
}