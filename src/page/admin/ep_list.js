import React, {useEffect, useState, useRef} from "react";

import "./ep_list.css"

import axios from "axios";
import config from "../../config.json";

import userAtom from "../../stores/user";
import {useRecoilState} from "recoil";

import {Link} from "react-router-dom"

export default function Podcast() {
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

	return (
		<>
			<div className="episodeListContainer">
				<h1>Liste des épisodes</h1>

				<table className="u-full-width">
					<thead>
						<tr>
							<th>Nom de l'épisode</th>
						</tr>
					</thead>
					<tbody>
						{episodes.map((ep) => (
							<tr key={ep.id}>
								<td><Link to={"/a/edit_episode/" + ep.id}>{ep.title}</Link></td>
							</tr>
						))}
					</tbody>
				</table>

			</div>
		</>
	)
}