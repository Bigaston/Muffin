import React from "react";
import { useDarkTheme } from "../utils"

import "./themeToggle.css"

export default function ThemeToggle() {
	const { toggleTheme } = useDarkTheme();

	return <div className="themeToggle" onClick={() => toggleTheme()}>
		<p>☀️</p>
		<p>🌙</p>
	</div>
}