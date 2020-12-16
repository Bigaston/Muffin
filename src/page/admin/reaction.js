import React, { useEffect, useState } from "react";

import './reaction.css'

import axios from "axios";
import config from "../../config.json"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { Helmet } from "react-helmet";

import twemoji from "twemoji";

import Modal from "../../component/modal";

export default function ImportPodcast() {
	let [userState,] = useRecoilState(userAtom);
	const [reaction, setReaction] = useState([]);
	const [emoji, setEmoji] = useState("");
	const [nomLong, setNomLong] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/reaction/get_all"
		}).then(res => {
			if (res.status === 200) {
				setReaction(res.data);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState])

	function addReaction() {
		if (!emoji || !nomLong) {
			setErrorMessage("Merci de complêter les deux champs avant d'ajouter une réaction");
			return;
		}

		setErrorMessage("");

		axios({
			method: "POST",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/reaction/create",
			data: {
				emoji: emoji,
				name: nomLong
			}
		}).then(res => {
			setEmoji("");
			setNomLong("");
			axios({
				method: "GET",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				url: config.host + "/api/admin/reaction/get_all"
			}).then(res => {
				if (res.status === 200) {
					setReaction(res.data);
				}
			}).catch(err => {
				console.log(err)
			})
		}).catch(err => {
			console.log(err)
		})
	}

	const [openModal, setOpenModal] = useState(false);
	const [editId, setEditId] = useState(null);
	const [editEmoji, setEditEmoji] = useState("");
	const [editName, setEditName] = useState("");
	function editReact(id, index) {
		setEditId(id);
		setEditEmoji(reaction[index].emoji);
		setEditName(reaction[index].name);
		setOpenModal(true);
	}

	function editReactSubmit() {
		axios({
			method: "POST",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/reaction/edit/" + editId,
			data: {
				emoji: editEmoji,
				name: editName
			}
		}).then(res => {
			if (res.status === 200) {
				setEditId(null);
				setOpenModal(false);
				axios({
					method: "GET",
					headers: {
						"Authorization": "Bearer " + userState.jwt
					},
					url: config.host + "/api/admin/reaction/get_all"
				}).then(res => {
					if (res.status === 200) {
						setReaction(res.data);
					}
				}).catch(err => {
					console.log(err)
				})
			}
		}).catch(res => {
			console.log(res);
		})
	}

	function deleteReact(id) {
		axios({
			method: "DELETE",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/reaction/delete/" + id
		}).then(res => {
			if (res.status === 200) {
				axios({
					method: "GET",
					headers: {
						"Authorization": "Bearer " + userState.jwt
					},
					url: config.host + "/api/admin/reaction/get_all"
				}).then(res => {
					if (res.status === 200) {
						setReaction(res.data);
					}
				}).catch(err => {
					console.log(err)
				})
			}
		}).catch(err => {
			console.log(err);
		})
	}

	return (
		<>
			<Helmet>
				<title>Reactions - Muffin</title>
			</Helmet>
			<div className="reactionContainer">
				<h1>Gérer les réactions</h1>
				<table class="u-full-width">
					<thead>
						<tr>
							<th>Emoji</th>
							<th>Nom</th>
							<th>Modifier</th>
							<th>Supprimer</th>
						</tr>
					</thead>
					<tbody>
						{reaction.map((r, i) => (
							<tr key={r.id}>
								<td dangerouslySetInnerHTML={{ __html: twemoji.parse(r.emoji) }}></td>
								<td>{r.name}</td>
								<td><button onClick={() => { editReact(r.id, i) }}>🖋️</button></td>
								<td><button onClick={() => { deleteReact(r.id) }}>🗑️</button></td>
							</tr>
						))}
					</tbody>
				</table>

				<h2>Ajouter une réaction</h2>
				{errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
				<div className="row">
					<div className="two columns">
						<label htmlFor="emoji">L'émoji</label>
						<input className="u-full-width" type="text" value={emoji} onChange={(e) => { setEmoji(e.target.value) }} />
					</div>
					<div className="eight columns">
						<label htmlFor="emoji">Le nom de la réaction</label>
						<input className="u-full-width" type="text" value={nomLong} onChange={(e) => { setNomLong(e.target.value) }} />
					</div>
					<div className="two columns">
						<button className='button-primary valid' onClick={addReaction}>Valider</button>
					</div>
				</div>
			</div>

			<Modal open={openModal} onCancel={() => { setOpenModal(false); setEditId(null) }}>
				<h1>Modifier une réaction</h1>
				<label htmlFor="emoji">L'émoji</label>
				<input className="u-full-width" type="text" value={editEmoji} onChange={(e) => { setEditEmoji(e.target.value) }} />
				<label htmlFor="emoji">Le nom de la réaction</label>
				<input className="u-full-width" type="text" value={editName} onChange={(e) => { setEditName(e.target.value) }} />
				<button className='button-primary valid' onClick={editReactSubmit}>Valider</button>
			</Modal>
		</>
	)
}