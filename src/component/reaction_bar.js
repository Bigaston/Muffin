import React, { useEffect, useState } from "react";

import FingerprintJS from '@fingerprintjs/fingerprintjs';

import axios from "axios";
import config from "../config.json"

import twemoji from "twemoji"

import "./reaction_bar.css"

export default function ReactionBar({ slug }) {
	const [fingerprint, setFingerprint] = useState(null);
	const [reactions, setReactions] = useState([]);
	const [epReactions, setEpReactions] = useState([]);
	const [userReaction, setUserReaction] = useState(null);

	useEffect(() => {
		FingerprintJS.load().then(fp => {
			fp.get().then(result => {
				setFingerprint(result.visitorId);
				axios({
					method: "GET",
					url: config.host + "/reaction/get_reaction/" + result.visitorId + "/" + slug,
				}).then(res => {
					setReactions(res.data.reactions);
					setEpReactions(res.data.episode_reactions)
					setUserReaction(res.data.user_reaction);
				}).catch(err => {
					console.log(err)
				})
			})
		})
	}, [slug])

	function getReacById(id) {
		let retour = { count: 0, ReactionId: id };

		for (let i = 0; i < epReactions.length; i++) {
			if (epReactions[i].ReactionId === id) {
				retour = epReactions[i];
			}
		}

		return retour;
	}

	const [isOnRequest, setIsOnRequest] = useState(false);

	function changeReaction(id) {
		if (isOnRequest) return;
		setIsOnRequest(true)
		axios({
			method: "POST",
			url: config.host + "/reaction/post_reaction/",
			data: {
				fingerprint: fingerprint,
				slug: slug,
				reaction: id
			}
		}).then(res => {
			axios({
				method: "GET",
				url: config.host + "/reaction/get_reaction/" + fingerprint + "/" + slug,
			}).then(res => {
				setReactions(res.data.reactions);
				setEpReactions(res.data.episode_reactions)
				setUserReaction(res.data.user_reaction);
				setIsOnRequest(false);
			}).catch(err => {
				console.log(err)
				setIsOnRequest(false);
			})
		}).catch(err => {
			console.log(err)
			setIsOnRequest(false);
		})
	}

	return (
		<div className="reactionBar">
			{reactions.map(reac => (
				<div onClick={() => changeReaction(reac.id)} className={"oneReaction " + (userReaction !== null && userReaction.ReactionId === reac.id ? "selected" : "")} key={reac.id}>
					<div dangerouslySetInnerHTML={{ __html: twemoji.parse(reac.emoji) }}></div>
					<p>{getReacById(reac.id).count}</p>
				</div>
			))}
		</div>
	)
}