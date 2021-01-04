import React, { useState, useEffect } from "react"

import "./subscribe_btn.css";

import config from "../config.json"

import classnames from "classnames"

export default function SubscribeButton() {
	const [isSub, setIsSub] = useState(false);
	const [canSub, setCanSub] = useState(false);
	const [sw, setSw] = useState(undefined)

	useEffect(() => {
		setCanSub(('serviceWorker' in navigator) && ('PushManager' in window))

		navigator.serviceWorker.getRegistrations().then(function (registrations) {
			registrations.forEach(function (v) {
				if (v.active.scriptURL.includes("serviceSub")) {
					setIsSub(true);
					v.update((config.host !== "" ? "" : "/public/") + "serviceSub.js")
					setSw(v);
				}
			});
		});
	}, [])

	function launchSub() {

		if (!isSub) {
			window.Notification.requestPermission().then(perm => {
				if (perm === "granted") {
					navigator.serviceWorker.register((config.host !== "" ? "" : "/public/") + "serviceSub.js").then((res) => {
						setSw(res)
						setIsSub(true);
					})
				}
			})
		} else {
			sw.unregister().then(() => {
				setSw(undefined)
				setIsSub(false);
			});

		}
	}

	return (
		<>
			{canSub ?
				<div className="subContainer">
					<div className={classnames("sub", { "isSub": isSub })} onClick={launchSub}>
						<p>{isSub ? "ABONNE" : "S'ABONNER"}</p>
					</div >
				</div>
				: null}

		</>
	)
}