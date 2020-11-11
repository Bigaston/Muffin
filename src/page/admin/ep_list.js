import React, {useEffect, useState} from "react";

import "./ep_list.css"

import axios from "axios";
import config from "../../config.json";

import userAtom from "../../stores/user";
import {useRecoilState} from "recoil";

import {Link, useHistory} from "react-router-dom"

export default function Podcast() {
	let history = useHistory();
	let [userState, ] = useRecoilState(userAtom);
	let [episodes, setEpisodes] = useState([]);
	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/ep_list"
		}).then(res => {
			if (res.status === 200) {
				setEpisodes(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState])

	function editEp(event) {
		history.push("/a/edit_episode/" + event.target.attributes.ep_id.nodeValue);
	}

	function deleteEp(event) {
		axios({
			method: "DELETE",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/episode/" + event.target.attributes.ep_id.nodeValue
		}).then(res => {
			if (res.status === 200) {
				axios({
					method: "GET",
					headers: {
						"Authorization": "Bearer " + userState.jwt
					},
					url: config.host + "/api/admin/podcast/ep_list"
				}).then(res => {
					if (res.status === 200) {
						setEpisodes(res.data);
					}
				}).catch(err => {
					console.log(err)
				})
			}
		}).catch(err => {
			console.log(err)
		})
	}

	return (
		<>
			<div className="episodeListContainer">
				<h1>Liste des épisodes</h1>

				<table className="u-full-width">
					<thead>
						<tr>
							<th>Nom de l'épisode</th>
							<th>Modifier</th>
							<th>Supprimer</th>
						</tr>
					</thead>
					<tbody>
						{episodes.map((ep) => (
							<tr key={ep.id}>
								<td><Link to={"/a/edit_episode/" + ep.id}>{ep.title}</Link></td>
								<td><button className="button-primary" ep_id={ep.id} onClick={editEp}>🖊️</button></td>
								<td><button className="button-delete" ep_id={ep.id} onClick={deleteEp}>🗑️</button></td>
							</tr>
						))}
					</tbody>
				</table>

			</div>
		</>
	)
}