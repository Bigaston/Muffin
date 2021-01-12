import React, { useState, useEffect } from "react";

import './webhook.css'
import "./global.css"

import axios from "axios";
import config from "../../config.json"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { Helmet } from "react-helmet";

import Modal from "../../component/modal"

export default function ImportPodcast() {
	const [userState,] = useRecoilState(userAtom);

	/*useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/webhooks/get_all"
		}).then(res => {
			if (res.status === 200) {
				setWebhooks(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState])*/

	return (
		<>
			<Helmet>
				<title>Icecast - Muffin</title>
			</Helmet>
			<div className="container webhookContainer">
				<h1>Webhooks Discord</h1>
			</div>
		</>
	)
}