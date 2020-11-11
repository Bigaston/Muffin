import React, {useState, useEffect, useRef} from "react";

import "./add_episode.css"

import axios from "axios";
import config from "../../config.json";
import {toBase64} from "../../utils"

import userAtom from "../../stores/user";
import {useRecoilState} from "recoil";

import {useHistory} from "react-router-dom"

export default function Podcast() {
	let history = useHistory();
	let [userState, ] = useRecoilState(userAtom);
	let [episode, setEpisode] = useState({})

	function p(date) {
		return date < 10 ? "0" + date : date
	}

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast"
		}).then((res) => {
			if (res.status === 200) {
				let date = new Date();

				let new_info = {
					author: res.data.author,
					pub_date: p(date.getDate()) + "/" + p(date.getMonth()) + "/" + p(date.getFullYear()) + " " + p(date.getHours()) + ":" + p(date.getMinutes()),
					episode: 0,
					saison: 0,
					explicit: true,
					title: "",
					description: "",
					type: "full",
					slug: "",
					small_desc: ""
				}

				setEpisode(new_info)
			}
		})
	}, [userState])

	function handleAllInput(event) {
		let new_info = {...episode};

		new_info[event.target.attributes.id.nodeValue] = event.target.value;
		setEpisode(new_info)
	}

	function handleCheckbox(event) {
		let new_info = {...episode};

		new_info.explicit = event.target.checked;

		setEpisode(new_info)
	}

	let filepicker_img = useRef(undefined);
	let filepicker_audio = useRef(undefined);
	let [percentCompleted, setPercentCompleted] = useState(0);
	let [errorMessage, setErrorMessage] = useState("");

	function uploadEpisode() {
		if (!episode.title || !episode.slug || !episode.small_desc || !episode.author || !episode.pub_date || !episode.type || episode.episode === undefined || episode.saison === undefined || !episode.description || filepicker_audio.current.files.length !== 1) {
			setErrorMessage("L'un des champs obligatoire n'est pas remplis! Merci de complêter tous les champs avec *");
			return;
		}

		setErrorMessage("")

		// Vérification de si l'image est de la bonne taille
		if (filepicker_img.current.files.length === 1) {
			let file_img = filepicker_img.current.files[0];
			let img = new Image();
			img.src = window.URL.createObjectURL(file_img)
	
			img.onload = () => {
				if (img.naturalHeight === 1400 && img.naturalWidth === 1400) {
					toBase64(file_img).then(base64img => {
						afterImageCheck(base64img)
					}).catch(err => {
						console.log(err)
					})
				} else {
					setErrorMessage("Votre image doit être au format 1400x1400 pour être acceptée par iTunes et les lecteurs de podcasts")
					return;
				}
			}
		} else {
			afterImageCheck(null)
		}

		function afterImageCheck(base64img) {
			toBase64(filepicker_audio.current.files[0]).then(base64audio => {
				let data_ep = {...episode};

				data_ep.enclosure = base64audio;
				data_ep.img = base64img

				axios({
					method: "POST",
					headers: {
						"Authorization": "Bearer " + userState.jwt
					},
					url: config.host + "/api/admin/podcast/new_episode",
					data: data_ep,
					onUploadProgress: progressEvent => {
						setPercentCompleted(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
					}
				}).then(res => {
					if (res.status === 200) {
						history.push("/a/episodes")
					}
				}).catch(err => {
					console.log(err)
				})
			}).catch(err => {
				console.log(err)
			})
		}
	}

	return (
		<>
			<div className="addEpisodeContainer">
				<h1>Créer un épisode</h1>

				<label htmlFor="title">Titre de l'épisode*</label>
				<input className="u-full-width" type="text" id="title" value={episode.title} onChange={handleAllInput}/>
				<label htmlFor="author">Auteur de épisode*</label>
				<input className="u-full-width" type="text" id="author" value={episode.author} onChange={handleAllInput}/>
				<label htmlFor="pub_date">Date de publication*</label>
				<input className="u-full-width" type="text" id="pub_date" value={episode.pub_date} onChange={handleAllInput}/>
			
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
						<input className="u-full-width" type="number" id="episode" value={episode.episode} onChange={handleAllInput}/>
					</div>
					<div className="four columns">
						<label htmlFor="saison">N° De Saison*</label>
						<input className="u-full-width" type="number" id="saison" value={episode.saison} onChange={handleAllInput}/>
					</div>
				</div>
				<p className="info">(Mettez 0 comme numéro de saison ou d'épisode si cela ne correspond pas à votre podcast)</p>
				<input type="checkbox" id="explicit" value={episode.explicit} onChange={handleCheckbox} />
				<span className="label-body">Contenu explicite</span>

				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={episode.description} onChange={handleAllInput}></textarea>
				<p className="info">(Pour faire de la mise en page, utilisez le Markdown!)</p>

				<label htmlFor="small_desc">Description courte*</label>
				<textarea className="u-full-width" id="small_desc" value={episode.small_desc} onChange={handleAllInput}></textarea>
				<p className="info">({episode.small_desc ? episode.small_desc.length : "0"}/255)</p>

				<label htmlFor="slug">Lien de l'épisode*</label>
				<input className="u-full-width" type="text" id="slug" value={episode.slug} onChange={handleAllInput}/>
				<p className="info">(Le lien pour accèter à votre épisode, exemple : muffin.pm/<bold>episode1</bold>)</p>

				<label htmlFor="img">Image de l'épisode</label>
				<input type="file" id="img" ref={filepicker_img} accept="image/png, image/jpeg" />
				<p className="info">(Si vous n'en entrez pas, l'image utilisée sera celle du podcast)</p>

				<label htmlFor="enclosure">Audio de l'épisode*</label>
				<input type="file" id="enclosure" ref={filepicker_audio} accept="audio/mpeg" />

				{!!errorMessage ? <p className="errorMessage">{errorMessage}</p> : <></>}
				<button className="button-primary" onClick={uploadEpisode}>Créer l'épisode</button>
				{percentCompleted !== 0 ?
					<progress max="100" value={percentCompleted} />
				:<></>}
			</div>
		</>
	)
}