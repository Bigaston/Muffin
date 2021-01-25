import React from "react";

import config from "../../config.json"
import { useHistory } from "react-router-dom"
import { Helmet } from "react-helmet";

import ThemeToggle from "../../component/themeToggle"

import "./episode.css";

export default function EpisodePage() {
	let history = useHistory();

	const handleReturnMenu = () => {
		history.push("/")
	}

	return (
		<>
			<img className="backToMenuImg" src={config.host + "/public/arrow-left.svg"} alt="Retourner à l'index" onClick={handleReturnMenu} />
			<div className="headerBox">
				<div className="header" style={{ backgroundImage: "url(" + config.host + "/public/muffin.jpg)" }}></div>
			</div>
			<div className="hoverHeader" overflow="hidden"></div>
			<div className="hoverHeader2" overflow="hidden"></div>
			<div className="topPageEpisode">
				<img src={config.host + "/public/muffin.jpg"} alt={"Logo de Muffin"} />
			</div>

			<div className="content">
				<Helmet>
					<title>{"A propos de Muffin"}</title>
					<meta property="og:title" content={"A propos de Muffin"}></meta>
					<meta property="og:description" content="Présentaton de l'hébergeur Muffin, qui s'occupe de faire tourner ce podcast!"></meta>
					<meta name="description" content="Présentaton de l'hébergeur Muffin, qui s'occupe de faire tourner ce podcast!"></meta>
					<meta property="og:image" content={window.location.protocol + "//" + window.location.hostname + "/public/muffin.jpg"}></meta>
				</Helmet>
				<h2 className="contentHeader">A propos de Muffin</h2>
				<div className="descriptionEp">
					<p>Muffin est un gestionnaire de podcast pensé pour être simple, auto hébergé, et contenant toutes les fonctionnalitées dont vous pourrez avoir besoin pour héberger votre propre podcast.</p>
					<p>Pour en savoir plus sur Muffin vous pouvez venir sur la <a href="https://muffin.pm" alt="Le Site de Muffin">documentation officielle</a></p>
					<p>Muffin a été codé par <a href="https://twitter.com/Bigaston">Bigaston</a>. N'hésitez pas à venir poser des questions sur Twitter en cas de soucis, et si vous voulez me soutenir financièrement, vous pouvez le faire sur <a href="https://utip.io/Bigaston">mon uTip</a>!</p>

					<h2>Crédits</h2>
					<ul>
						<li>Les icones des podcasts proviennent du projet <a href="https://github.com/PodShows/podicons/">PodIcon</a> de Phil_Goud </li>
						<li>Les autres icones viennent de <a href="https://fontawesome.com/">FontAwesome</a></li>
						<li>Le logo de Muffin a été dessiné par <a href="https://twitter.com/LaMifflue">Mifflue</a></li>
					</ul>

					<h2>podCloud Labo</h2>
					<p>Muffin est un projet podCloud Labo! Si vous voulez créer un podcast sans avoir à l'héberger vous même, n'hésitez pas à aller voir <a href="https://podcloud.fr">leur site</a>.</p>
					<p>Le support de Muffin se fait également sur le <a href="https://podcloud.fr/discord">Discord de podCloud</a></p>
				</div>
			</div>

			<ThemeToggle />
		</>
	)
}