import React from "react";

import Icon from "./icon"

export default function IconDonation({ link }) {
	let service = "tip";

	if (link?.includes("tipeee")) {
		service = "tipeee"
	} else if (link?.includes("patreon")) {
		service = "patreon"
	} else if (link?.includes("paypal")) {
		service = "paypal"
	}
	return (
		<Icon name={service} link={link} />
	)
}