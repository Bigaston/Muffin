require("dotenv").config();

const express = require('express')
const path = require("path")

var app = express()

app.use("/static", express.static('./web/static'));

app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, "./web/index.html"))
})

app.listen(process.env.PORT, () => console.log(`Serveur lancé sur le port ${process.env.PORT}`))