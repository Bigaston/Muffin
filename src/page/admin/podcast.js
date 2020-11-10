import React, {useEffect, useState, useRef} from "react";

import "./podcast.css"

import axios from "axios";
import config from "../../config.json";
import itunes_category from "./itunes_category.json"
import Modal from "../../component/modal"

import {toBase64} from "../../utils"

import userAtom from "../../stores/user";
import {useRecoilState} from "recoil";

export default function Podcast() {
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

	return (
		<>
			<div className="podcastAdminContainer">
				<h1>Modifier mon podcast</h1>

				<label htmlFor="title">Titre du podcast</label>
				<input className="u-full-width" type="text" id="title" value={podcast.title} onChange={handleAllInput}/>
				<label htmlFor="slogan">Slogan du podcast</label>
				<input className="u-full-width" type="text" id="slogan" value={podcast.slogan} onChange={handleAllInput}/>
				<label for="description">Description</label>
				<textarea class="u-full-width" id="description" value={podcast.description} onChange={handleAllInput}></textarea>
				<label htmlFor="author">Auteur du podcast</label>
				<input className="u-full-width" type="text" id="author" value={podcast.author} onChange={handleAllInput}/>
				<label htmlFor="email">Email du flux</label>
				<input className="u-full-width" type="email" id="email" value={podcast.email} onChange={handleAllInput}/>
				
				<label for="itunes_category">Categorie iTunes</label>
				<select class="u-full-width" id="itunes_category" value={currentCategory} onChange={handleChangeCategory}>
					{Object.keys(itunes_category).map((category) => (
						<option value={category}>{category}</option>
					))}
				</select>

				{currentCategorySub.length !== 0 ?
					<>
						<label for="itunes_subcategory">Sous-catégorie iTunes</label>
						<select class="u-full-width" id="itunes_subcategory" value={currentSub} onChange={handleChangeSub}>
							{currentCategorySub.map((category) => (
								<option value={category}>{category}</option>
							))}
						</select>
					</>
				:<></>}

				<p className="fakeLabel">Logo</p>
				<img className="podcastLogo" src={config.host + podcast.logo} alt="Logo du podcast" />
				<button onClick={editImage}>Modifier l'image</button>
			</div>
			
			<Modal open={openEditImage} onCancel={() => {setOpenEditImage(false)}}>
				<h1>Modifier l'image</h1>
				<input type="file" ref={filepicker_image} accept="image/png, image/jpeg"/>
				{!!errorMessageImg ? <p className="errorMessageImg">{errorMessageImg}</p> : <></>}
				<button class="button-primary" onClick={validImage}>Valider</button> <button onClick={() => {setOpenEditImage(false)}}>Annuler</button>
				{percentCompleted !== 0 ?
					<progress max="100" value={percentCompleted} />
				:<></>}
			</Modal>
		</>
	)
}