import React, { useState } from "react";

import "./login.css"
import "../../style/normalize.css"
import "../../style/skeleton.css"

import axios from "axios";
import config from "../../config.json"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { useHistory } from "react-router-dom"

import Loader from "../../component/loader"

export default function Login() {
	let history = useHistory();
	let [, setUserState] = useRecoilState(userAtom);
	let [login, setLogin] = useState("");
	let [password, setPassword] = useState("");
	let [errorMessage, setErrorMessage] = useState("");
	let [isLoading, setIsLoading] = useState(false);

	const handleConnect = () => {
		if (!login || !password) {
			setErrorMessage("Les deux champs ne sont pas remplis!")
			return
		}

		if (isLoading) return;
		setIsLoading(true);

		setErrorMessage("")

		axios({
			method: "POST",
			url: config.host + "/api/user/login",
			data: {
				login: login,
				password: password
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

				setIsLoading(false);
				setUserState(new_user)
				localStorage.setItem("jwt", res.data.jwt);
				history.push("/")
			}
		}).catch(err => {
			setIsLoading(false);
			if (err.response.status === 400) {
				setErrorMessage("Les deux champs ne sont pas remplis!")
			} else if (err.response.status === 401) {
				setErrorMessage("Le nom d'utilisateur ou le mot de passe est incorecte!")
			}
			console.log(err)
		})
	}

	return (
		<div className="loginContainer">
			<h1>Se Connecter</h1>
			<label htmlFor="login">Nom d'utilisateur</label>
			<input className="u-full-width" type="text" id="login" value={login} onChange={(e) => { setLogin(e.target.value) }} />
			<label htmlFor="password">Mot de passe</label>
			<input className="u-full-width" type="password" id="password" value={password} onChange={(e) => { setPassword(e.target.value) }} />

			{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : <></>}
			<button className="button-primary" onClick={handleConnect}>Se connecter</button>
			<Loader loading={isLoading} />
		</div>
	)
}