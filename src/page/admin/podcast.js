import React, {useEffect, useState, useRef} from "react";

import "./podcast.css"

import axios from "axios";
import config from "../../config.json";
import itunes_category from "./itunes_category.json"
import Modal from "../../component/modal"

import {toBase64} from "../../utils"

import userAtom from "../../stores/user";
import {useRecoilState} from "recoil";

import {Link, useHistory} from "react-router-dom"

export default function Podcast() {
	let history = useHistory()
	let [userState, ] = useRecoilState(userAtom);
	let [podcast, setPodcast] = useState({})
	let [currentCategory, setCurrentCategory] = useState("");
	let [currentCategorySub, setCurrentCategorySub] = useState([]);
	let [currentSub, setCurrentSub] = useState("")

	useEffect(() => {
		axios({
			method: "GET",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast"
		}).then(res => {
			if (res.status === 200) {
				setPodcast(res.data);
				setCurrentCategory(res.data.itunes_category);
				setCurrentCategorySub(itunes_category[res.data.itunes_category]);
				setCurrentSub(res.data.itunes_subcategory);
			}
		}).catch(err => {
			console.log(err)
		})
	}, [userState])

	function handleAllInput(event) {
		let new_info = {...podcast};

		new_info[event.target.attributes.id.nodeValue] = event.target.value;
		setPodcast(new_info)
	}

	function handleChangeCategory(event) {
		setCurrentCategory(event.target.value);
		setCurrentCategorySub(itunes_category[event.target.value]);

		if (itunes_category[event.target.value].length === 0) {
			setCurrentSub("");
		}
	}

	function handleChangeSub(event) {
		setCurrentSub(event.target.value);
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
			if (img.naturalHeight === 1400 && img.naturalWidth === 1400) {
				toBase64(file).then(base64 => {
					axios({
						method: "POST",
						headers: {
							"Authorization": "Bearer " + userState.jwt
						},
						url: config.host + "/api/admin/podcast/img",
						data: {
							image: base64
						},
						onUploadProgress: progressEvent => {
							setPercentCompleted(Math.floor((progressEvent.loaded * 100) / progressEvent.total));
						}
					}).then(res => {
						if (res.status === 200) {
							setOpenEditImage(false);

							let reload_img = {...podcast}
							reload_img.logo = config.host + "/img/pod.jpg#" + Date.now()
							
							setPodcast(reload_img)
						}
					}).catch(err => {
						console.log(err)
					})
				}).catch(err => {
					console.log(err)
				})
			} else {
				setErrorMessageImg("Votre image doit être au format 1400x1400 pour être acceptée par iTunes et les lecteurs de podcasts")
				return;
			}
		}
	}

	let [errorMessageEdit, setErrorMessageEdit] = useState("");

	function savePodcast() {
		if (!podcast.title || !podcast.slogan || !podcast.description || !podcast.author || !podcast.email || !podcast.itunes_category) {
			setErrorMessageEdit("Merci de completer tous les champs marqués d'un *!")
			return;
		}

		setErrorMessageEdit("");

		let edited_podcast = {...podcast};
		edited_podcast.itunes_category = currentCategory;
		edited_podcast.itunes_subcategory = currentSub;

		axios({
			method: "POST",
			headers: {
				"Authorization": "Bearer " + userState.jwt
			},
			url: config.host + "/api/admin/podcast/info",
			data: edited_podcast
		}).then(res => {
			if (res.status === 200) {
				history.push("/")
			}
		}).catch(err => {
			console.log(err)
		})
	}

	return (
		<>
			<div className="podcastAdminContainer">
				<h1>Modifier mon podcast</h1>

				<label htmlFor="title">Titre du podcast*</label>
				<input className="u-full-width" type="text" id="title" value={podcast.title} onChange={handleAllInput}/>
				<label htmlFor="slogan">Slogan du podcast*</label>
				<input className="u-full-width" type="text" id="slogan" value={podcast.slogan} onChange={handleAllInput}/>
				<label htmlFor="description">Description*</label>
				<textarea className="u-full-width" id="description" value={podcast.description} onChange={handleAllInput}></textarea>
				<label htmlFor="author">Auteur du podcast*</label>
				<input className="u-full-width" type="text" id="author" value={podcast.author} onChange={handleAllInput}/>
				<label htmlFor="email">Email du flux*</label>
				<input className="u-full-width" type="email" id="email" value={podcast.email} onChange={handleAllInput}/>
				
				<label htmlFor="itunes_category">Categorie iTunes*</label>
				<select className="u-full-width" id="itunes_category" value={currentCategory} onChange={handleChangeCategory}>
					{Object.keys(itunes_category).map((category) => (
						<option key={category} value={category}>{category}</option>
					))}
				</select>

				{currentCategorySub.length !== 0 ?
					<>
						<label htmlFor="itunes_subcategory">Sous-catégorie iTunes*</label>
						<select className="u-full-width" id="itunes_subcategory" value={currentSub} onChange={handleChangeSub}>
							{currentCategorySub.map((category) => (
								<option key={category} value={category}>{category}</option>
							))}
						</select>
					</>
				:<></>}

				<label htmlFor="type">Type de podcast*</label>
				<select className="u-full-width" id="type" value={podcast.type} onChange={handleAllInput}>
					<option value="episodic">Du plus récent au plus vieux</option>
					<option value="serial">Du plus vieux au plus récent</option>
				</select>

				<label htmlFor="prefix">Prefix de stats</label>
				<input className="u-full-width" type="url" id="prefix" value={podcast.prefix} onChange={handleAllInput}/>
				<p>Collez ici le préfix de statistiques fournit par un service comme Podtrac ou Chartable. Attention, en cas de mauvaise configuration, vos fichiers pourront ne plus être accessibles!</p>
				{!!errorMessageEdit ? <p className="errorMessageEdit">{errorMessageEdit}</p> : <></>}
				<button className="button-primary" style={{width: "100%"}}onClick={savePodcast}>Enregistrer</button>


				<p className="fakeLabel">Logo</p>
				<img className="podcastLogo" src={config.host + podcast.logo} alt="Logo du podcast" />
				<button onClick={editImage}>Modifier l'image</button>
			</div>
			
			<Modal open={openEditImage} onCancel={() => {setOpenEditImage(false)}}>
				<h1>Modifier l'image</h1>
				<input type="file" ref={filepicker_image} accept="image/png, image/jpeg"/>
				{!!errorMessageImg ? <p className="errorMessageImg">{errorMessageImg}</p> : <></>}
				<button className="button-primary" onClick={validImage}>Valider</button> <button onClick={() => {setOpenEditImage(false)}}>Annuler</button>
				{percentCompleted !== 0 ?
					<progress max="100" value={percentCompleted} />
				:<></>}
			</Modal>
		</>
	)
}