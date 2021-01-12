import React from "react";
import { Link } from "react-router-dom"

import "./to_about.css"
import pkg from "../../package.json";

export default function ToAbout() {
	return (
		<p className="toabout">Fonctionne avec <Link to="/about">Muffin</Link> - v{pkg.version}</p>
	)
}