require("dotenv").config();

const express = require('express')
var cors = require('cors')
const path = require("path")
const m = require("./modules")

var app = express()

app.use(express.json());
app.use(cors({
	origin: "http://localhost:3000"
}))
app.use("/public", express.static('./public'));
app.use(express.static('build'))
app.use("/img", express.static("./upload/img"))
app.use("/audio", express.static("./upload/audio"))

app.get("/api/podcast/get_info", m.podcast_ctrl.get_info);
app.get("/api/podcast/get_ep_info/:slug", m.podcast_ctrl.get_ep_info);

app.post("/api/user/login", m.user_ctrl.login);
app.post("/api/user/whoami", m.user_ctrl.whoami);


app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(process.env.SERVER_PORT, () => console.log(`Serveur lancé sur le port ${process.env.SERVER_PORT}`))