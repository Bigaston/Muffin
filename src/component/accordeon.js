import React, { useState } from "react";

export default function Accordeon({ text, children }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<p className="fakeLabel hoverable" onClick={() => { setOpen(c => !c) }}>{open ? "▼" : "▶"} {text}</p>
			{open ?
				children
				: null}
		</>
	)
}