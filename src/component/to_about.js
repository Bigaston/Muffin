import React from "react";
import { Link } from "react-router-dom"

import "./to_about.css"

export default function ToAbout() {
	return (
		<p className="toabout">Fonctionne avec <Link to="/about">Muffin</Link></p>
	)
}