const bdd = require("../../models")
const fs = require("fs");
const path = require("path")
const pngToJpeg = require('png-to-jpeg');

module.exports = {
	check_slug: (req, res) => {
		if (!!req.params.slug) {
			checkSlug(req.params.slug).then(ok_slug => {
				if (ok_slug) {
					res.json({ ok: true })
				} else {
					res.json({ ok: false })
				}
			})
		} else {
			res.json({ ok: false })
		}
	},
	add_playlist: (req, res) => {
		checkSlug(req.body.slug).then(ok_slug => {
			if (ok_slug) {

				bdd.Playlist.create({
					title: req.body.title,
					description: req.body.description,
					slug: req.body.slug,
				}).then(pl => {
					if (req.body.img !== null) {
						let img_buffer = new Buffer.from(req.body.img.split(/,\s*/)[1], "base64");

						if (req.body.img.startsWith("data:image/png;")) {
							pngToJpeg({ quality: 90 })(img_buffer)
								.then(output => {
									fs.writeFileSync(path.join(__dirname, "../../upload/img/playlist_" + pl.id + ".jpg"), output);

									pl.img = "/img/playlist_" + pl.id + ".jpg";
									pl.save().then(() => {
										res.send("OK");
									})
								});
						} else {
							fs.writeFileSync(path.join(__dirname, "../../upload/img/playlist_" + pl.id + ".jpg"), img_buffer);

							pl.img = "/img/playlist_" + pl.id + ".jpg";
							pl.save().then(() => {
								res.send("OK");
							})
						}
					} else {
						pl.img = "/img/pod.jpg";
						pl.save().then(() => {
							res.send("OK");
						})
					}
				})
			} else {
				res.status(400).send("Bad Slug")
			}
		})
	},
	get_playlist_list: (req, res) => {
		bdd.Playlist.findAll({ attributes: ["id", "title", "slug"], orderById: [["id", "DESC"]] }).then(playlists => {
			res.json(playlists);
		})
	},
	delete_playlist: (req, res) => {
		bdd.Playlist.findByPk(req.params.id).then(playlist => {
			if (playlist.img !== "/img/pod.jpg" && fs.existsSync(path.join(__dirname, "../../upload/img/playlist_" + playlist.id + ".jpg"))) {
				fs.unlinkSync(path.join(__dirname, "../../upload/img/playlist_" + playlist.id + ".jpg"));
			}

			playlist.destroy().then(() => {
				res.send("OK");
			})
		})
	},
	get_playlist_admin: (req, res) => {
		bdd.Playlist.findOne({ where: { id: req.params.id }, include: bdd.Episode }).then(playlist => {
			res.json(playlist)
		})
	},
	edit_playlist_info: (req, res) => {
		checkSlug(req.body.slug).then(ok_slug => {
			bdd.Playlist.findOne({ where: { id: req.body.id } }).then(playlist => {
				if (ok_slug || req.body.slug === playlist.slug) {
					playlist.title = req.body.title
					playlist.description = req.body.description
					playlist.slug = req.body.slug

					playlist.save().then(() => {
						res.send("OK");
					})
				} else {
					res.status(400).send("Bad Slug")
				}
			})
		})

	},
	edit_playlist_img: (req, res) => {
		bdd.Playlist.findByPk(req.params.id).then(playlist => {
			let img_buffer = new Buffer.from(req.body.image.split(/,\s*/)[1], "base64");

			if (req.body.image.startsWith("data:image/png;")) {
				pngToJpeg({ quality: 90 })(img_buffer)
					.then(output => {
						fs.writeFileSync(path.join(__dirname, "../../upload/img/playlist_" + playlist.id + ".jpg"), output);
						playlist.img = "/img/playlist_" + playlist.id + ".jpg";
						playlist.save().then(() => {
							res.send("OK");
						})
					});
			} else {
				fs.writeFileSync(path.join(__dirname, "../../upload/img/playlist_" + playlist.id + ".jpg"), img_buffer);
				playlist.img = "/img/playlist_" + playlist.id + ".jpg";
				playlist.save().then(() => {
					res.send("OK");
				})
			}
		})
	},
	delete_playlist_img: (req, res) => {
		bdd.Playlist.findByPk(req.params.id).then(playlist => {
			if (fs.existsSync(path.join(__dirname, "../../upload/img/playlist_" + playlist.id + ".jpg"))) {
				fs.unlinkSync(path.join(__dirname, "../../upload/img/playlist_" + playlist.id + ".jpg"));
			}

			playlist.img = "/img/pod.jpg";
			playlist.save().then(() => {
				res.send("OK");
			})
		})
	},
	delete_episode_playlist: (req, res) => {
		bdd.EpisodePlaylist.findOne({ where: { EpisodeId: req.params.episode, PlaylistId: req.params.playlist } }).then(episodeplaylist => {
			episodeplaylist.destroy().then(() => {
				res.send("OK")
			})
		})
	},
	add_episode_playlist: (req, res) => {
		bdd.EpisodePlaylist.findAll({ where: { PlaylistId: req.params.playlist }, order: [["place", "DESC"]] }).then(last_ep_pl => {
			bdd.EpisodePlaylist.create({
				place: last_ep_pl[0].place + 1,
				EpisodeId: req.params.episode,
				PlaylistId: req.params.playlist
			}).then(() => {
				res.send("OK");
			})
		})
	},
	save_order: (req, res) => {
		let i = 0;

		function checkEpPlace(_cb) {
			if (i === req.body.length) {
				_cb()
				return;
			};

			let ep = req.body[i];

			bdd.EpisodePlaylist.findOne({ where: { EpisodeId: ep.EpisodePlaylist.EpisodeId, PlaylistId: ep.EpisodePlaylist.PlaylistId } }).then(episodeplaylist => {
				if (episodeplaylist.place !== i) {
					episodeplaylist.place = i;
					episodeplaylist.save().then(() => {
						i++;
						checkEpPlace(_cb);
					})
				} else {
					i++;
					checkEpPlace(_cb);
				}
			})
		}

		checkEpPlace(() => {
			res.send("OK");
		})
	},
	get_all_playlist_admin: (req, res) => {
		bdd.Playlist.findAll({ attributes: ["title", "id"] }).then(playlists => {
			res.json(playlists);
		})
	}
}

function checkSlug(slug) {
	return new Promise((resolve, reject) => {
		bdd.Playlist.findOne({ where: { slug: slug } }).then(episode => {
			resolve(episode === null);
		})
	})
}