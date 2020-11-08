require("dotenv").config();

const express = require('express')
const path = require("path")
const m = require("./modules")

var app = express()

app.use("/public", express.static('./public'));
app.use(express.static('build'))
app.use("/img", express.static("./upload/img"))
app.use("/audio", express.static("./upload/audio"))

app.get("/api/episodes/all", m.podcast_ctrl.get_all_episodes);


app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(process.env.PORT, () => console.log(`Serveur lancé sur le port ${process.env.PORT}`))