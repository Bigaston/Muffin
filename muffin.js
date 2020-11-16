require("dotenv").config();

const express = require('express')
var cors = require('cors')
const m = require("./modules")
var compression = require('compression');

var app = express()

app.use(compression());
app.use(express.json({ limit: '1000mb' }));
app.use(cors({
	origin: "http://localhost:3000"
}))
app.use("/public", express.static('./public'));
app.use("/img", express.static("./upload/img"))
app.use("/audio", express.static("./upload/audio"))

app.get("/api/podcast/get_info", m.podcast_ctrl.get_info);
app.get("/api/podcast/get_ep_info/:slug", m.podcast_ctrl.get_ep_info);

app.get("/api/admin/podcast", m.user_ctrl.check_if_logged, m.podcast_ctrl.get_info_admin);
app.post("/api/admin/podcast/img", m.user_ctrl.check_if_logged, m.podcast_ctrl.edit_pod_img);
app.post("/api/admin/podcast/info", m.user_ctrl.check_if_logged, m.podcast_ctrl.edit_info);
app.post("/api/admin/podcast/new_episode", m.user_ctrl.check_if_logged, m.podcast_ctrl.add_episode)
app.get("/api/admin/podcast/ep_list", m.user_ctrl.check_if_logged, m.podcast_ctrl.get_ep_list);
app.get("/api/admin/podcast/episode/:id", m.user_ctrl.check_if_logged, m.podcast_ctrl.get_ep_info_admin);
app.post("/api/admin/podcast/save", m.user_ctrl.check_if_logged, m.podcast_ctrl.edit_ep_info);
app.post("/api/admin/podcast/edit_ep_img/:id", m.user_ctrl.check_if_logged, m.podcast_ctrl.edit_ep_img);
app.delete("/api/admin/podcast/delete_ep_img/:id", m.user_ctrl.check_if_logged, m.podcast_ctrl.delete_ep_img);
app.post("/api/admin/podcast/edit_ep_audio/:id", m.user_ctrl.check_if_logged, m.podcast_ctrl.edit_ep_audio)
app.delete("/api/admin/podcast/episode/:id", m.user_ctrl.check_if_logged, m.podcast_ctrl.delete_episode)
app.post("/api/admin/podcast/import", m.user_ctrl.check_if_logged, m.podcast_ctrl.import_podcast);

app.post("/api/user/login", m.user_ctrl.login);
app.post("/api/user/whoami", m.user_ctrl.whoami);
app.post("/api/admin/user/change_username", m.user_ctrl.check_if_logged, m.user_ctrl.change_username);
app.post("/api/admin/user/change_password", m.user_ctrl.check_if_logged, m.user_ctrl.change_password)

app.get("/rss", m.rss_ctrl.create_rss);

// API du player
app.get("/api/player/episode/:slug", m.player_ctrl.episode_by_slug)
app.use("/player", express.static('./player/build'))
app.get("/player/*", m.player_ctrl.send_index)

// SSR
app.get("/a/*", m.ssr_ctrl.send_index);
app.get("/", m.ssr_ctrl.send_index_podcast);
app.get("/:slug", m.ssr_ctrl.send_index_epispde);

app.use(express.static('build'))

app.get("/*", m.ssr_ctrl.send_index);

app.listen(process.env.SERVER_PORT, () => console.log(`Serveur lancé sur le port ${process.env.SERVER_PORT}`))