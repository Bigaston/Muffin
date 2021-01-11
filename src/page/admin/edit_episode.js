import React, { useEffect, useState, useRef } from "react";

import "./edit_episode.css"

import axios from "axios";
import config from "../../config.json";
import Modal from "../../component/modal"
import Accordeon from "../../component/accordeon"

import userAtom from "../../stores/user";
import { useRecoilState } from "recoil";

import { toBase64 } from "../../utils"

import { useParams } from "react-router-dom"

import { Helmet } from "react-helmet";

import { useHistory } from "react-router-dom"

import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export default function Podcast() {
	let history = useHistory()
	let [userState,] = useRecoilState(userAtom);
	let [episode, setEpisode] = useState({});
	let { id } = useParams();
	const [playlists, setPlaylists] = useState([]);
	const [igdb, setIgdb] = useState(false);

	const transcriptFile = useRef(undefined);

	function p(date) {
		return date < 10 ? "0" + date : date
	}

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/episode/" + id,
		}).then(res => {
			if (res.status === 200) {
				let data_ep = { ...res.data };
				let date = new Date(data_ep.pub_date);

				data_ep.pub_date = p(date.getDate()) + "/" + p(date.getMonth() + 1) + "/" + p(date.getFullYear()) + " " + p(date.getHours()) + ":" + p(date.getMinutes());
				data_ep.audio = data_ep.enclosure + "#" + Date.now();
				data_ep.transcript = data_ep.transcript === null ? "" : data_ep.transcript

				if (!Array.isArray(data_ep.games)) {
					data_ep.games = [];
				}

				setEpisode(data_ep)

				axios({
					method: "GET",
					headers: {
						"Authorization": "Bearer " + userState.jwt
					},
					url: config.host + "/api/admin/playlist/get_all_playlist",
				}).then(res_pl => {
					let my_playlist = [];

					res.data.Playlists.forEach(pl => {
						my_playlist.push(pl.id);
					})

					let ze_playlists = res_pl.data.map(pl => {
						return { ...pl, added: my_playlist.includes(pl.id) }
					})

					setPlaylists(ze_playlists)
				}).catch(err => {
					console.log(err);
				})
			}
		}).catch(err => {
			console.log(err)
		})

		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/igdb/caniuse",
		}).then(res => {
			setIgdb(res.data)
		}).catch(err => {
			console.log(err);
		})
	}, [userState, id])

	function handleAllInput(event) {
		let new_info = { ...episode };

		new_info[event.target.attributes.id.nodeValue] = event.target.value;
		setEpisode(new_info)
	}

	function handleCheckbox(event) {
		let new_info = { ...episode };

		new_info.explicit = event.target.checked;

		setEpisode(new_info)
	}

	let [isSlugOk, setIsSlugOk] = useState(true);
	function handleSlug(event) {
		let new_info = { ...episode };

		new_info.slug = event.target.value;

		setEpisode(new_info)

		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/check_slug/" + event.target.value
		}).then(res => {
			if (res.status === 200) {
				setIsSlugOk(res.data.ok);
			}
		})
	}

	let [errorMessage, setErrorMessage] = useState("");
	function saveEp() {
		if (!episode.title || !episode.slug || !episode.small_desc || !episode.author || !episode.pub_date || !episode.type || episode.episode === undefined || episode.saison === undefined || !episode.description) {
			setErrorMessage("L'un des champs obligatoire n'est pas remplis! Merci de complêter tous les champs avec *");
			return;
		}

		if (!isSlugOk) {
			setErrorMessage("Le lien que vous avez entré n'est pas valide");
			return;
		}

		setErrorMessage("");

		episode.pub_date = dayjs(episode.pub_date, "DD/MM/YYYY hh:mm")

		if (transcriptFile.current && transcriptFile.current.files.length !== 0) {
			toBase64(transcriptFile.current.files[0]).then(base64srt => {
				episode.transcript_file_raw = base64srt;
				continueTraitement()
			})
		} else {
			continueTraitement();
		}

		function continueTraitement() {
			axios({
				method: "POST",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				url: config.host + "/api/admin/podcast/save",
				data: episode
			}).then(res => {
				alert("Episode sauvegardé!");
				history.push("/a/episodes")
				console.log(res)
			}).catch(err => {
				console.log(err);
			})
		}


	}

	let [openEditImage, setOpenEditImage] = useState(false);
	let filepicker_image = useRef(undefined)
	let [errorMessageImg, setErrorMessageImg] = useState("");
	let [percentCompleted, setPercentCompleted] = useState(0);

	function editImage() {
		setOpenEditImage(true)
		setPercentCompleted(0);
	}

	function validImage() {
		if (filepicker_image.current.files.length !== 1) {
			setErrorMessageImg("Merci de sélectionner une image!")
			return;
		}

		setErrorMessageImg("");

		// Vérification de si l'image est de la bonne taille
		let file = filepicker_image.current.files[0];
		let img = new Image();
		img.src = window.URL.createObjectURL(file)

		img.onload = () => {
			if (img.naturalHeight === img.naturalWidth) {
				toBase64(file).then(base64 => {
					axios({
						method: "POST",
						headers: {
							"Authorization": "Bearer " + userState.jwt
						},
						url: config.host + "/api/admin/podcast/edit_ep_img/" + id,
						data: {
							image: base64
						},
						onUploadProgress: progressEvent => {
							setPercentCompleted(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
						}
					}).then(res => {
						if (res.status === 200) {
							setOpenEditImage(false);

							let reload_img = { ...episode }
							reload_img.img = config.host + "/img/" + id + ".jpg#" + Date.now()

							setEpisode(reload_img)
						}
					}).catch(err => {
						console.log(err)
					})
				}).catch(err => {
					console.log(err)
				})
			} else {
				setErrorMessageImg("Votre image doit être au format carré!")
				return;
			}
		}
	}

	function deleteImage() {
		axios({
			method: "DELETE",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/delete_ep_img/" + id,
		}).then(res => {
			if (res.status === 200) {
				let reload_img = { ...episode }
				reload_img.img = config.host + "/img/pod.jpg#" + Date.now()

				setEpisode(reload_img)
			}
		}).catch(err => {
			console.log(err)
		})
	}

	let [openEditAudio, setOpenEditAudio] = useState(false);
	let filepicker_audio = useRef(undefined)
	let [percentCompletedAudio, setPercentCompletedAudio] = useState(0);
	let [errorMessageAudio, setErrorMessageAudio] = useState("");
	let [during, setDuring] = useState(false)

	function editAudio() {
		setOpenEditAudio(true)
		setPercentCompletedAudio(0);
	}

	function validAudio() {
		if (during) return;
		if (filepicker_audio.current.files.length !== 1) {
			setErrorMessageAudio("Merci de sélectionner un fichier audio!")
			return;
		}

		setErrorMessageAudio("");
		setDuring(true);

		toBase64(filepicker_audio.current.files[0]).then(base64audio => {
			axios({
				method: "POST",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				url: config.host + "/api/admin/podcast/edit_ep_audio/" + id,
				data: {
					enclosure: base64audio
				},
				onUploadProgress: progressEvent => {
					setPercentCompletedAudio(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
				}
			}).then(res => {
				if (res.status === 200) {
					setOpenEditAudio(false);

					window.location.reload();
				}
			}).catch(err => {
				console.log(err)
				setDuring(false);
			})
		}).catch(err => {
			console.log(err)
			setDuring(false);
		})
	}

	const [openAddPlaylist, setOpenAddPlaylist] = useState(false)

	function handleOpenAddPlaylist() {
		setOpenAddPlaylist(true);
	}

	function handleChangePlaylist(checked, index) {
		setPlaylists(current => {
			current[index].added = checked;

			return current;
		})

		if (checked) {
			axios({
				method: "POST",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				url: config.host + "/api/admin/playlist/add_playlist_ep/" + playlists[index].id + "/" + id,
			}).then(res => {
				if (res.status === 200) {
					console.log("Added to " + playlists[index].title)
				}
			}).catch(err => {
				console.log(err)
			})
		} else {
			axios({
				method: "DELETE",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				url: config.host + "/api/admin/playlist/delete_playlist_ep/" + playlists[index].id + "/" + id,
			}).then(res => {
				if (res.status === 200) {
					console.log("Removed from " + playlists[index].title)
				}
			}).catch(err => {
				console.log(err)
			})
		}
	}

	function resendNotif() {
		axios({
			method: "POST",
			url: config.host + "/api/push/resend/" + id,
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
		}).then(res => {
			console.log("OK");
		})
	}

	const [currentGames, setCurrentGames] = useState("");
	const [currentGamesTyping, setCurrentGamesTyping] = useState(undefined);
	const [searchResult, setSearchResult] = useState([]);

	function handleCurrentGames(event) {
		setCurrentGames(event.target.value);

		if (currentGamesTyping) {
			clearTimeout(currentGamesTyping);
		}

		setCurrentGamesTyping(setTimeout(() => {
			axios({
				method: "POST",
				url: config.host + "/api/igdb/search",
				headers: {
					"Authorization": "Bearer " + userState.jwt
				},
				data: {
					name: event.target.value
				}
			}).then(res => {
				setSearchResult(res.data);
			}).catch(err => {
				console.log(err)
			})
		}, 500))
	}

	function choseTheGame(id, index) {
		setEpisode(current => {
			let id_tab = [];

			current.games.forEach(g => {
				id_tab.push(g.id);
			})

			if (!id_tab.includes(id)) {
				current.games.push({
					id: searchResult[index].id,
					image_id: searchResult[index].image_id,
					name: searchResult[index].name,
					url: searchResult[index].url
				})
			}

			return current;
		})

		setCurrentGames("");
		setSearchResult([]);
	}

	function handleDeleteGame(index) {
		let new_data = { ...episode };

		new_data.games.splice(index, 1);

		setEpisode(new_data)
	}

	return (
		<>
			<Helmet>
				<title>Modifier un épisode - Muffin</title>
			</Helmet>
			<div className="episodeEditContainer">
				<h1>Modifier un épisode</h1>

				<label htmlFor="title">Titre de l'épisode*</label>
				<input className="u-full-width" type="text" id="title" value={episode.title} onChange={handleAllInput} />
				<label htmlFor="author">Auteur de épisode*</label>
				<input className="u-full-width" type="text" id="author" value={episode.author} onChange={handleAllInput} />
				<label htmlFor="pub_date">Date de publication*</label>
				<input className="u-full-width" type="text" id="pub_date" value={episode.pub_date} onChange={handleAllInput} />

				<div className="row">
					<div className="four columns">
						<label htmlFor="type">Type d'épisode*</label>
						<select className="u-full-width" id="type" value={episode.type} onChange={handleAllInput}>
							<option value="full">Episode</option>
							<option value="trailer">Bande annonce</option>
							<option value="bonus">Bonus</option>
						</select>
					</div>
					<div className="four columns">
						<label htmlFor="episode">N° D'épisode*</label>
						<input className="u-full-width" type="number" id="episode" value={episode.episode} onChange={handleAllInput} />
					</div>
					<div className="four columns">
						<label htmlFor="saison">N° De Saison*</label>
						<input className="u-full-width" type="number" id="saison" value={episode.saison} onChange={handleAllInput} />
					</div>
				</div>
				<p className="info">(Mettez 0 comme numéro de saison ou d'épisode si cela ne correspond pas à votre podcast)</p>
				<input type="checkbox" id="explicit" defaultChecked={episode.explicit} value={episode.explicit} onClick={handleCheckbox} />
				<span className="label-body">Contenu explicite</span>

				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={episode.description} onChange={handleAllInput}></textarea>
				<p className="info">(Pour faire de la mise en page, utilisez le Markdown!)</p>

				<label htmlFor="small_desc">Description courte*</label>
				<textarea className="u-full-width" id="small_desc" value={episode.small_desc} onChange={handleAllInput}></textarea>
				<p className="info">({episode.small_desc ? episode.small_desc.length : "0"}/255)</p>

				<label htmlFor="slug">Lien de l'épisode*</label>
				<input className="u-full-width" style={{ borderColor: !isSlugOk ? "red" : undefined }} type="text" id="slug" value={episode.slug} onChange={handleSlug} />
				<p className="info">(Le lien pour accéder à votre épisode, exemple : muffin.pm/<span className="bold">episode1</span>)</p>

				<button className="full" onClick={handleOpenAddPlaylist}>Gérer les playlists</button>
				{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : <></>}

				<Accordeon text="Modification du transcript">
					<label htmlFor="transcript">Texte du transcript</label>
					<textarea className="u-full-width" id="transcript" value={episode.transcript} onChange={handleAllInput}></textarea>

					{episode.transcript_file ?
						<label htmlFor="transcript_file">Modifier le fichier de transcript (<a href={config.host + episode.transcript_file}>Le fichier actuel</a>)</label>
						:
						<label htmlFor="transcript_file">Ajouter un fichier de transcript</label>
					}
					<input type="file" id="transcript_file" ref={transcriptFile} accept=".srt" />

					<p className="info">Le texte du transcript sera affiché uniquement sur la page de votre épisode. Le fichier de transcript au format .srt sera lui exposé dans le flux RSS, et affiché sur la page de l'épisode, avec des timecodes pour laisser les utilisateurs sauter directement au bon moment dans l'épisode</p>
				</Accordeon>

				{igdb ?
					<Accordeon text="Modifier le/les jeux">
						<div className="currentGames">
							{episode.games?.map((g, index) => (
								<div key={g.id} className="oneCurrentGame" onClick={() => handleDeleteGame(index)}>
									{g.image_id ? <img src={"//images.igdb.com/igdb/image/upload/t_thumb/" + g.image_id + ".jpg"} alt={g.name + " cover"} /> : null}
									<p>{g.name}</p>
								</div>
							))}
						</div>

						<h3>Ajouter un jeu</h3>
						<label htmlFor="addGames">Nom du jeu</label>
						<input className="u-full-width" type="text" id="addGames" value={currentGames} onChange={handleCurrentGames} />
						<div className="searchTab">
							{searchResult.map((g, index) => (
								<div key={g.id} className="searchResult" onClick={() => choseTheGame(g.id, index)}>
									<div className="searchResultImg">
										{g.cover ? <img src={g.cover} alt={g.name + " cover"} /> : null}

									</div>
									<div>
										<p>{g.name}</p>
										{g.summary ? <p>{g.summary.substring(0, 300)} {g.summary.length > 300 ? "[...]" : null}</p> : null}
									</div>
								</div>
							))}
						</div>
						<hr />
					</Accordeon>
					: null}

				<button className="button-primary" onClick={saveEp}>Enregistrer</button>

				<p className="fakeLabel">Logo</p>
				<img className="podcastLogo" src={config.host + episode.img} alt="Logo de l'épisode" />
				<button onClick={editImage}>Modifier l'image</button> <button className="button-delete" onClick={deleteImage}>Supprimer l'image</button>

				<p className="fakeLabel">Audio de l'épisode</p>
				<audio className="podcastAudio" src={config.host + episode.audio} alt="Audio de l'épisode" controls />
				<button onClick={editAudio}>Modifier l'audio</button> <br />

				<button className="button" onClick={resendNotif}>Renvoyer les notifications</button>
			</div>

			<Modal open={openEditImage} onCancel={() => { setOpenEditImage(false) }}>
				<h1>Modifier l'image</h1>
				<input type="file" ref={filepicker_image} accept="image/png, image/jpeg" />
				{!!errorMessageImg ? <p className="errorMessageImg">{errorMessageImg}</p> : <></>}
				<button className="button-primary" onClick={validImage}>Valider</button> <button onClick={() => { setOpenEditImage(false) }}>Annuler</button>
				{percentCompleted !== 0 ?
					<progress max="100" value={percentCompleted} />
					: <></>}
			</Modal>

			<Modal open={openEditAudio} onCancel={() => { setOpenEditAudio(false) }}>
				<h1>Modifier l'audio</h1>
				<input type="file" ref={filepicker_audio} accept="audio/mpeg" />
				{!!errorMessageAudio ? <p className="errorMessageImg">{errorMessageAudio}</p> : <></>}
				<button className="button-primary" onClick={validAudio}>Valider</button> <button onClick={() => { setOpenEditAudio(false) }}>Annuler</button>
				{percentCompletedAudio !== 0 ?
					<progress max="100" value={percentCompletedAudio} />
					: <></>}
			</Modal>

			<Modal open={openAddPlaylist} onCancel={() => { setOpenAddPlaylist(false) }}>
				<h1>Gérer les playlists</h1>
				<div className="playlistContainer">
					<ul>
						{playlists.map((pl, index) => (
							<li key={pl.id}>
								<input type="checkbox" id="explicit" value={pl.added} defaultChecked={pl.added} onChange={(event) => { handleChangePlaylist(event.target.checked, index) }} />
								<span className="labelCheck">{pl.title}</span>
							</li>
						))}
					</ul>

				</div>
				<button onClick={() => { setOpenAddPlaylist(false) }}>Fermer</button>
			</Modal>
		</>
	)
}