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
	const [webhooks, setWebhooks] = useState([]);
	useEffect(() => {
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
	}, [userState])

	const [errorMessage, setErrorMessage] = useState("");
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");

	function addWebhook() {
		if (!name || !url) {
			setErrorMessage("Merci de complêter les deux champs avant d'ajouter un webhook");
			return;
		}

		setErrorMessage("");

		axios({
			method: "POST",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/webhooks/create",
			data: {
				name: name,
				url: url
			}
		}).then(res => {
			setName("");
			setUrl("");
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
		}).catch(err => {
			console.log(err)
		})
	}

	const [openModal, setOpenModal] = useState(false);
	const [editId, setEditId] = useState(null);
	const [editUrl, setEditUrl] = useState("");
	const [editName, setEditName] = useState("");
	function editWebhook(id, index) {
		setEditId(id);
		setEditUrl(webhooks[index].url);
		setEditName(webhooks[index].name);
		setOpenModal(true);
	}

	function editWebhookSubmit() {
		axios({
			method: "POST",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/webhooks/edit/" + editId,
			data: {
				url: editUrl,
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
					url: config.host + "/api/admin/webhooks/get_all"
				}).then(res => {
					if (res.status === 200) {
						setWebhooks(res.data);
					}
				}).catch(err => {
					console.log(err)
				})
			}
		}).catch(res => {
			console.log(res);
		})
	}

	function deleteWebhook(id) {
		axios({
			method: "DELETE",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/webhooks/delete/" + id
		}).then(res => {
			if (res.status === 200) {
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
			}
		}).catch(err => {
			console.log(err);
		})
	}

	return (
		<>
			<Helmet>
				<title>Webhooks - Muffin</title>
			</Helmet>
			<div className="container webhookContainer">
				<h1>Webhooks Discord</h1>
				<p>Vous pouvez coller ici le lien d'un webhook vers un channel Discord pour que soit posté automatiquement dedans un message lors de la publication d'un épisode</p>
				<h2>Liste des webhooks Discord</h2>

				<table class="u-full-width">
					<thead>
						<tr>
							<th>Nom</th>
							<th>URL</th>
							<th>Modifier</th>
							<th>Supprimer</th>
						</tr>
					</thead>
					<tbody>
						{webhooks.map((r, i) => (
							<tr key={r.id}>
								<td>{r.name}</td>
								<td>{r.url}</td>
								<td><button onClick={() => { editWebhook(r.id, i) }}>🖋️</button></td>
								<td><button onClick={() => { deleteWebhook(r.id) }}>🗑️</button></td>
							</tr>
						))}
					</tbody>
				</table>

				<h2>Ajouter un webhook</h2>
				{errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
				<div className="row">
					<div className="four columns">
						<label htmlFor="name">Le nom</label>
						<input className="u-full-width" id="name" type="text" value={name} onChange={(e) => { setName(e.target.value) }} />
					</div>
					<div className="six columns">
						<label htmlFor="url">Le lien du Webhook</label>
						<input className="u-full-width" id="url" type="url" value={url} onChange={(e) => { setUrl(e.target.value) }} />
					</div>
					<div className="two columns">
						<button className='button-primary valid' onClick={addWebhook}>Valider</button>
					</div>
				</div>

				<Modal open={openModal} onCancel={() => { setOpenModal(false); setEditId(null) }}>
					<h1>Modifier une réaction</h1>
					<label htmlFor="name">Le nom</label>
					<input className="u-full-width" id="name" type="text" value={editName} onChange={(e) => { setEditName(e.target.value) }} />
					<label htmlFor="url">Le lien du Webhook</label>
					<input className="u-full-width" id="url" type="url" value={editUrl} onChange={(e) => { setEditUrl(e.target.value) }} />
					<button className='button-primary valid' onClick={editWebhookSubmit}>Valider</button>
				</Modal>
			</div>
		</>
	)
}