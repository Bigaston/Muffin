import React, { useEffect, useState } from "react";

import "./playlist_list.css"

import axios from "axios";
import config from "../../config.json";

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { Link, useHistory } from "react-router-dom"

import { Helmet } from "react-helmet";

export default function Podcast() {
	let history = useHistory();
	let [userState,] = useRecoilState(userAtom);
	let [playlists, setPlaylists] = useState([]);

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/playlist/list"
		}).then(res => {
			if (res.status === 200) {
				setPlaylists(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState])

	function editPlaylist(event) {
		history.push("/a/edit_playlist/" + event.target.attributes.pl_id.nodeValue);
	}

	function deletePlaylist(event) {
		axios({
			method: "DELETE",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/playlist/delete/" + event.target.attributes.pl_id.nodeValue
		}).then(res => {
			if (res.status === 200) {
				axios({
					method: "GET",
					headers: {
						"Authorization": "Bearer " + userState.jwt
					},
					url: config.host + "/api/admin/playlist/list"
				}).then(res => {
					if (res.status === 200) {
						setPlaylists(res.data);
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
			<Helmet>
				<title>Liste des playlists - Muffin</title>
			</Helmet>
			<div className="playlistListContainer">
				<h1>Liste des playlists</h1>
				<button className="button-primary" onClick={() => { history.push("/a/new_playlist") }}>Créer une playlist</button>

				<table className="u-full-width">
					<thead>
						<tr>
							<th>Nom de la playlist</th>
							<th>Modifier</th>
							<th>Supprimer</th>
						</tr>
					</thead>
					<tbody>
						{playlists.map((pl) => (
							<tr key={pl.id}>
								<td><Link to={"/a/edit_playlist/" + pl.id}>{pl.title}</Link></td>
								<td><button className="button-primary" pl_id={pl.id} onClick={editPlaylist}>🖊️</button></td>
								<td><button className="button-delete" pl_id={pl.id} onClick={deletePlaylist}>🗑️</button></td>
							</tr>
						))}
					</tbody>
				</table>

			</div>
		</>
	)
}