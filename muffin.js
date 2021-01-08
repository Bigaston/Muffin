require("dotenv").config();

const express = require('express')
var cors = require('cors')
const m = require("./modules")
var compression = require('compression');

m.planified.check_planified();
setInterval(m.planified.check_planified, 10 * 1000);

if (!!process.env.TWITCH_ID && !!process.env.TWITCH_SECRET) {
	m.igdb.get_access_token();
}

var app = express()

app.use(compression());
app.use(express.json({ limit: '3000mb' }));
app.use(cors({
	origin: "http://localhost:3000"
}))
app.use("/public", express.static('./public'));

// Static Files
app.get("/audio/:file", m.static_ctrl.audio);
app.get("/img/:file", m.static_ctrl.image);
app.get("/srt/:file", m.static_ctrl.srt);

app.get("/api/podcast/get_info", m.podcast_ctrl.get_info);
app.get("/api/podcast/get_ep_info/:slug", m.podcast_ctrl.get_ep_info);

app.get("/api/playlist/get_info", m.playlist_ctrl.get_playlist);
app.get("/api/playlist/get_one_info/:slug", m.playlist_ctrl.get_one_info)

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
app.get("/api/admin/podcast/check_slug/:slug", m.user_ctrl.check_if_logged, m.podcast_ctrl.check_slug);

app.get("/api/admin/playlist/check_slug/:slug", m.user_ctrl.check_if_logged, m.playlist_ctrl.check_slug)
app.post("/api/admin/playlist/new_playlist", m.user_ctrl.check_if_logged, m.playlist_ctrl.add_playlist);
app.get("/api/admin/playlist/list", m.user_ctrl.check_if_logged, m.playlist_ctrl.get_playlist_list);
app.delete("/api/admin/playlist/delete/:id", m.user_ctrl.check_if_logged, m.playlist_ctrl.delete_playlist);
app.get("/api/admin/playlist/get_playlist/:id", m.user_ctrl.check_if_logged, m.playlist_ctrl.get_playlist_admin);
app.post("/api/admin/playlist/edit", m.user_ctrl.check_if_logged, m.playlist_ctrl.edit_playlist_info)
app.post("/api/admin/playlist/edit_playlist_img/:id", m.user_ctrl.check_if_logged, m.playlist_ctrl.edit_playlist_img);
app.delete("/api/admin/playlist/delete_playlist_img/:id", m.user_ctrl.check_if_logged, m.playlist_ctrl.delete_playlist_img);
app.delete("/api/admin/playlist/delete_playlist_ep/:playlist/:episode", m.user_ctrl.check_if_logged, m.playlist_ctrl.delete_episode_playlist);
app.post("/api/admin/playlist/add_playlist_ep/:playlist/:episode", m.user_ctrl.check_if_logged, m.playlist_ctrl.add_episode_playlist);
app.post("/api/admin/playlist/change_episode_order/:id", m.user_ctrl.check_if_logged, m.playlist_ctrl.save_order);
app.get("/api/admin/playlist/get_all_playlist", m.user_ctrl.check_if_logged, m.playlist_ctrl.get_all_playlist_admin);
app.get("/api/admin/playlist/get_playlist_widget", m.user_ctrl.check_if_logged, m.playlist_ctrl.get_playlist_widget);

app.post("/api/user/login", m.user_ctrl.login);
app.post("/api/user/whoami", m.user_ctrl.whoami);
app.post("/api/admin/user/change_username", m.user_ctrl.check_if_logged, m.user_ctrl.change_username);
app.post("/api/admin/user/change_password", m.user_ctrl.check_if_logged, m.user_ctrl.change_password)

app.get("/rss", m.rss_ctrl.create_rss);

// API du player
app.get("/api/player/episode/latest", m.player_ctrl.last_episode)
app.get("/api/player/episode/:slug", m.player_ctrl.episode_by_slug)
app.get("/api/player/playlist/:slug_playlist/latest", m.player_ctrl.last_episode_playlist)
app.get("/api/player/playlist/:slug_playlist/:slug", m.player_ctrl.episode_by_slug_playlist)
app.use("/player", express.static('./player/build'))
app.get("/player/*", m.player_ctrl.send_index)

// Reactions
app.get("/api/admin/reaction/get_all", m.user_ctrl.check_if_logged, m.reaction_ctrl.get_admin_react);
app.post("/api/admin/reaction/create", m.user_ctrl.check_if_logged, m.reaction_ctrl.add_reaction)
app.delete("/api/admin/reaction/delete/:id", m.user_ctrl.check_if_logged, m.reaction_ctrl.delete_reaction);
app.post("/api/admin/reaction/edit/:id", m.user_ctrl.check_if_logged, m.reaction_ctrl.update_reaction);
app.get("/api/admin/reaction/get_user_reaction", m.user_ctrl.check_if_logged, m.reaction_ctrl.get_user_reaction);
app.get("/reaction/get_reaction/:fingerprint/:slug", m.reaction_ctrl.get_reaction);
app.post("/reaction/post_reaction", m.reaction_ctrl.post_reaction);

// Webhooks
app.get("/api/admin/webhooks/get_all", m.user_ctrl.check_if_logged, m.webhook_ctrl.get_all_webhooks);
app.post("/api/admin/webhooks/create", m.user_ctrl.check_if_logged, m.webhook_ctrl.create);
app.post("/api/admin/webhooks/edit/:id", m.user_ctrl.check_if_logged, m.webhook_ctrl.edit)
app.delete("/api/admin/webhooks/delete/:id", m.user_ctrl.check_if_logged, m.webhook_ctrl.delete)

// Webpush
app.get("/api/push/vapid", m.web_push_ctrl.vapid);
app.post("/api/push/save", m.web_push_ctrl.save);
app.post("/api/push/resend/:id", m.user_ctrl.check_if_logged, m.web_push_ctrl.resend)

// IGDB
app.get("/api/igdb/caniuse", m.user_ctrl.check_if_logged, m.igdb_ctrl.can_use)
app.post("/api/igdb/search", m.user_ctrl.check_if_logged, m.igdb_ctrl.search_game)

// SSR
app.get("/a/*", m.ssr_ctrl.send_index);
app.get("/p/:slug", m.ssr_ctrl.send_index_playlist)
app.get("/", m.ssr_ctrl.send_index_podcast);
app.get("/:slug", m.ssr_ctrl.send_index_epispde);

app.use(express.static('build'))

app.get("/*", m.ssr_ctrl.send_index);

app.listen(process.env.SERVER_PORT, () => console.log(`Serveur lancé sur le port ${process.env.SERVER_PORT}`))