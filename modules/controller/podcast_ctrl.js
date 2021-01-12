const bdd = require("../../models")
const fs = require("fs");
const path = require("path");
const pngToJpeg = require('png-to-jpeg');
var md = require('markdown-it')({
	html: true,
	breaks: true,
	linkify: true
});
const getMP3Duration = require('get-mp3-duration')
const { Op } = require("sequelize");
let Parser = require('rss-parser');
const axios = require("axios");
const planified_module = require("../planified")

module.exports = {
	get_info: (req, res) => {
		bdd.Episode.findAll({
			where: {
				pub_date: {
					[Op.lte]: new Date(),
				}
			}
		}).then(episodes => {
			bdd.Podcast.findOne().then(podcast => {
				let return_obj = {
					title: podcast.title,
					description: podcast.description,
					slogan: podcast.slogan,
					author: podcast.author,
					logo: podcast.logo,
					data: podcast.data,
					episodes: []
				}

				episodes.forEach(ep => {
					let enclosure;
					if (!!podcast.prefix) {
						enclosure = podcast.prefix + process.env.HOST_SITE.replace("https://", "").replace("http://", "") + ep.enclosure;
					} else {
						enclosure = process.env.HOST_SITE + ep.enclosure
					}

					let ep_obj = {
						title: ep.title,
						description: ep.desc_parsed,
						small_desc: ep.small_desc,
						pub_date: ep.pub_date,
						author: ep.author,
						audio: enclosure,
						duration: ep.duration,
						img: ep.img,
						ep_number: ep.episode,
						saison_number: ep.saison,
						slug: ep.slug,
					}

					return_obj.episodes.push(ep_obj);
				})

				if (podcast.type === "episodic") {
					return_obj.episodes.sort(orderTableByDate)
					res.json(return_obj);
				} else if (podcast.type === "serial") {
					return_obj.episodes.sort(orderTableByDateInvert)
					res.json(return_obj);
				}

			})
		})
	},
	get_ep_info: (req, res) => {
		bdd.Episode.findAll({
			where: {
				slug: req.params.slug, pub_date: {
					[Op.lte]: new Date(),
				}
			}
		}).then(episode => {
			bdd.Podcast.findOne().then(podcast => {
				let return_pod = {
					title: podcast.title,
					description: podcast.description,
					slogan: podcast.slogan,
					author: podcast.author,
					logo: podcast.logo,
				}

				if (episode.length === 0) {
					res.json({ podcast: return_pod, episode: undefined })
				} else {
					let ep = episode[0];

					let enclosure;
					if (!!podcast.prefix) {
						enclosure = podcast.prefix + process.env.HOST_SITE.replace("https://", "").replace("http://", "") + ep.enclosure;
					} else {
						enclosure = process.env.HOST_SITE + ep.enclosure
					}

					let return_ep = {
						title: ep.title,
						description: ep.desc_parsed,
						small_desc: ep.small_desc,
						pub_date: ep.pub_date,
						author: ep.author,
						audio: enclosure,
						duration: ep.duration,
						img: ep.img,
						ep_number: ep.episode,
						saison_number: ep.saison,
						slug: ep.slug,
						transcript: ep.transcript,
						transcript_file: ep.transcript_file,
						games: ep.games
					}

					res.json({ episode: return_ep, podcast: return_pod })
				}
			})
		})
	},
	get_info_admin: (req, res) => {
		bdd.Podcast.findOne().then(podcast => {
			bdd.Episode.findAll({ where: { saison: { [Op.ne]: 0 }, episode: { [Op.ne]: 0 } }, limit: 1, order: [['createdAt', 'DESC']] }).then(episode => {
				if (episode.length === 0) episode = [{ saison: null, episode: null }];

				let return_obj = {
					title: podcast.title,
					description: podcast.description,
					slogan: podcast.slogan,
					author: podcast.author,
					email: podcast.email,
					itunes_category: podcast.itunes_category,
					itunes_subcategory: podcast.itunes_subcategory != null ? podcast.itunes_subcategory : "",
					prefix: podcast.prefix != null ? podcast.prefix : "",
					logo: podcast.logo,
					type: podcast.type,
					explicit: podcast.explicit,
					data: podcast.data,
					last_saison: episode[0].saison != null ? episode[0].saison : 0,
					last_ep: episode[0].episode != null ? episode[0].episode + 1 : 0
				}

				res.json(return_obj);
			})
		})
	},
	edit_pod_img: (req, res) => {
		let img_buffer = new Buffer.from(req.body.image.split(/,\s*/)[1], "base64");

		if (req.body.image.startsWith("data:image/png;")) {
			pngToJpeg({ quality: 90 })(img_buffer)
				.then(output => {
					fs.writeFileSync(path.join(__dirname, "../../export/img/pod.jpg"), output);
					bdd.Podcast.findOne().then(pod => {
						pod.logo = "/img/pod." + Date.now() + ".jpg"
						pod.save().then(() => {
							res.send("OK");
						})
					})
				});
		} else {
			fs.writeFileSync(path.join(__dirname, "../../export/img/pod.jpg"), img_buffer);
			bdd.Podcast.findOne().then(pod => {
				pod.logo = "/img/pod." + Date.now() + ".jpg"
				pod.save().then(() => {
					res.send("OK");
				})
			})
		}
	},
	edit_info: (req, res) => {
		if (!req.body.title || !req.body.slogan || !req.body.description || !req.body.author || !req.body.email || !req.body.itunes_category) {
			res.status(400).send("Bad request");
		} else {
			bdd.Podcast.findOne().then(podcast => {
				podcast.title = req.body.title;
				podcast.description = req.body.description;
				podcast.slogan = req.body.slogan;
				podcast.author = req.body.author;
				podcast.email = req.body.email;
				podcast.itunes_category = req.body.itunes_category;
				podcast.itunes_subcategory = req.body.itunes_subcategory;
				podcast.prefix = req.body.prefix;
				podcast.type = req.body.type;
				podcast.explicit = req.body.explicit;
				podcast.data = req.body.data;

				podcast.save().then(() => {
					res.send("OK")
				})
			})
		}
	},
	add_episode: (req, res) => {
		checkSlug(req.body.slug).then(ok_slug => {
			if (ok_slug) {

				bdd.Episode.create({
					title: req.body.title,
					description: req.body.description,
					desc_parsed: md.render(req.body.description),
					small_desc: req.body.small_desc,
					pub_date: req.body.pub_date,
					author: req.body.author,
					guid: Date.now(),
					type: req.body.type,
					episode: req.body.episode,
					saison: req.body.saison,
					slug: req.body.slug,
					explicit: req.body.explicit
				}).then(ep => {
					ep.transcript = req.body.transcript;

					if (!!req.body.transcript_file_raw) {
						let srt_buffer = new Buffer.from(req.body.transcript_file_raw.split(/,\s*/)[1], "base64");
						fs.writeFileSync(path.join(__dirname, "../../export/srt/" + ep.id + ".srt"), srt_buffer);
						ep.transcript_file = "/srt/" + ep.id + "." + Date.now() + ".srt";
					}

					if (req.body.img !== null) {
						let img_buffer = new Buffer.from(req.body.img.split(/,\s*/)[1], "base64");

						if (req.body.img.startsWith("data:image/png;")) {
							pngToJpeg({ quality: 90 })(img_buffer)
								.then(output => {
									fs.writeFileSync(path.join(__dirname, "../../export/img/" + ep.id + ".jpg"), output);

									ep.img = "/img/" + ep.id + "." + Date.now() + ".jpg";
									continueTraitementAddEp(ep)
								});
						} else {
							fs.writeFileSync(path.join(__dirname, "../../export/img/" + ep.id + ".jpg"), img_buffer);

							ep.img = "/img/" + ep.id + "." + Date.now() + ".jpg";
							continueTraitementAddEp(ep)
						}
					} else {
						ep.img = "/img/pod.jpg";
						ep.img = "/img/pod." + Date.now() + ".jpg";
						continueTraitementAddEp(ep)
					}
				})

				function continueTraitementAddEp(ep) {
					let audio_buffer = new Buffer.from(req.body.enclosure.split(/,\s*/)[1], "base64");

					fs.writeFileSync(path.join(__dirname, "../../export/audio/" + ep.id + ".mp3"), audio_buffer);
					ep.duration = convertHMS(Math.trunc(getMP3Duration(audio_buffer) / 1000));
					ep.enclosure = "/audio/" + ep.id + "." + Date.now() + ".mp3"

					let stats = fs.statSync(path.join(__dirname, "../../export/audio/" + ep.id + ".mp3"));
					ep.size = stats.size;

					ep.save().then(() => {
						// Gestion de la liste de publication
						if (new Date(req.body.pub_date) > new Date()) {
							bdd.Planified.create({
								EpisodeId: ep.id,
								date: req.body.pub_date
							}).then(() => {
								laSuite()
							})
						} else {
							planified_module.episode_published(ep);
							laSuite()
						}
					})

					function laSuite() {
						let playlist_array = []

						let i = 0;

						function appendPlaylistArray(_cb) {
							if (i === req.body.playlists.length) {
								_cb();
								return;
							}

							bdd.EpisodePlaylist.findAll({ where: { PlaylistId: req.body.playlists[i] }, order: [["place", "DESC"]] }).then(last_ep_pl => {
								let place = last_ep_pl.length === 0 ? 0 : last_ep_pl[0].place + 1
								let obj = {
									EpisodeId: ep.id,
									PlaylistId: req.body.playlists[i],
									place: place
								}
								playlist_array.push(obj);
								i++;
								appendPlaylistArray(_cb);
							})
						}

						appendPlaylistArray(() => {
							bdd.EpisodePlaylist.bulkCreate(playlist_array).then((episode_playlists) => {
								res.send("OK")
							})
						})
					}
				}
			} else {
				res.status(400).send("Bad Slug")
			}
		})
	},
	get_ep_list: (req, res) => {
		bdd.Episode.findAll().then(episodes => {
			let return_obj = [];
			episodes.forEach(ep => {
				let ep_obj = {
					id: ep.id,
					title: ep.title,
					slug: ep.slug
				}

				return_obj.push(ep_obj);
			})

			return_obj.sort(orderById)
			res.json(return_obj);
		})
	},
	get_ep_info_admin: (req, res) => {
		bdd.Episode.findAll({ where: { id: req.params.id }, include: bdd.Playlist }).then(episode => {
			let ep = episode[0];

			res.json(ep)
		})
	},
	edit_ep_info: (req, res) => {
		checkSlug(req.body.slug).then(ok_slug => {
			bdd.Episode.findOne({ where: { id: req.body.id } }).then(episode => {
				if (ok_slug || req.body.slug === episode.slug) {
					episode.title = req.body.title
					episode.description = req.body.description
					episode.desc_parsed = md.render(req.body.description)
					episode.small_desc = req.body.small_desc
					episode.pub_date = req.body.pub_date
					episode.author = req.body.author
					episode.type = req.body.type
					episode.episode = req.body.episode
					episode.saison = req.body.saison
					episode.slug = req.body.slug
					episode.explicit = req.body.explicit
					episode.transcript = req.body.transcript;
					episode.games = req.body.games;

					if (!!req.body.transcript_file_raw) {
						let srt_buffer = new Buffer.from(req.body.transcript_file_raw.split(/,\s*/)[1], "base64");
						fs.writeFileSync(path.join(__dirname, "../../export/srt/" + episode.id + ".srt"), srt_buffer);
						episode.transcript_file = "/srt/" + episode.id + "." + Date.now() + ".srt";
					}

					episode.save().then(() => {
						// Gestion de la liste de publication
						if (new Date(req.body.pub_date) > new Date()) {
							bdd.Planified.findOne({ where: { EpisodeId: episode.id } }).then((plan) => {
								if (plan !== null) {
									plan.date = req.body.pub_date;
									plan.save().then(() => {
										laSuite()
									})
								} else {
									bdd.Planified.create({
										EpisodeId: episode.id,
										date: req.body.pub_date
									}).then(() => {
										laSuite()
									})
								}
							})
						} else {
							bdd.Planified.findOne({ where: { EpisodeId: episode.id } }).then((plan) => {
								if (plan !== null) {
									plan.destroy().then(() => {
										planified_module.episode_published(episode)
										laSuite()
									})
								} else {
									laSuite();
								}
							})
						}
					})

					function laSuite() {
						res.send("OK");
					}
				} else {
					res.status(400).send("Bad Slug")
				}
			})
		})

	},
	edit_ep_img: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			let img_buffer = new Buffer.from(req.body.image.split(/,\s*/)[1], "base64");

			if (req.body.image.startsWith("data:image/png;")) {
				pngToJpeg({ quality: 90 })(img_buffer)
					.then(output => {
						fs.writeFileSync(path.join(__dirname, "../../export/img/" + episode.id + ".jpg"), output);
						episode.img = "/img/" + episode.id + "." + Date.now() + ".jpg";
						episode.save().then(() => {
							res.send("OK");
						})
					});
			} else {
				fs.writeFileSync(path.join(__dirname, "../../export/img/" + episode.id + ".jpg"), img_buffer);
				episode.img = "/img/" + episode.id + "." + Date.now() + ".jpg";
				episode.save().then(() => {
					res.send("OK");
				})
			}
		})
	},
	delete_ep_img: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			if (fs.existsSync(path.join(__dirname, "../../export/img/" + episode.id + ".jpg"))) {
				fs.unlinkSync(path.join(__dirname, "../../export/img/" + episode.id + ".jpg"));
			}

			episode.img = "/img/pod." + Date.now() + ".jpg";
			episode.save().then(() => {
				res.send("OK");
			})
		})
	},
	edit_ep_audio: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			let audio_buffer = new Buffer.from(req.body.enclosure.split(/,\s*/)[1], "base64");

			fs.writeFileSync(path.join(__dirname, "../../export/audio/" + episode.id + ".mp3"), audio_buffer);
			episode.duration = convertHMS(Math.trunc(getMP3Duration(audio_buffer) / 1000));
			episode.enclosure = "/audio/" + episode.id + "." + Date.now() + ".mp3"

			let stats = fs.statSync(path.join(__dirname, "../../export/audio/" + episode.id + ".mp3"));
			episode.size = stats.size;

			episode.save().then(() => {
				res.send("OK")
			})
		})
	},
	delete_episode: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			if (episode.img !== "/img/pod.jpg" && fs.existsSync(path.join(__dirname, "../../export/img/" + episode.id + ".jpg"))) {
				fs.unlinkSync(path.join(__dirname, "../../export/img/" + episode.id + ".jpg"));
			}

			fs.unlinkSync(path.join(__dirname, "../../export/audio/" + episode.id + ".mp3"));

			bdd.Planified.findOne({ where: { EpisodeId: episode.id } }).then(plan => {
				if (plan !== null) {
					plan.destroy().then(() => {
						episode.destroy().then(() => {
							res.send("OK");
						})
					})
				} else {
					episode.destroy().then(() => {
						res.send("OK");
					})
				}
			})

		})
	},
	import_podcast: (req, res) => {
		let parser = new Parser();

		parser.parseURL(req.body.url)
			.then(feed => {
				res.send("OK");
				console.log("Importation : Feed OK")

				bdd.Podcast.findOne().then(podcast => {
					if (feed.itunes === undefined) feed.itunes = { owner: {} };

					podcast.title = !!feed.title ? feed.title : "";
					podcast.description = !!feed.description ? feed.description : "";
					podcast.slogan = !!feed.itunes.subtitle ? feed.itunes.subtitle : "";
					podcast.author = !!feed.itunes.author ? feed.itunes.author : "";
					podcast.email = !!feed.itunes.owner.email ? feed.itunes.owner.email : "";
					podcast.itunes_category = feed.itunes.categories !== undefined ? feed.itunes.categories[0] : "";
					podcast.explicit = feed.itunes.explicit === "yes";

					podcast.save().then(() => {
						download(feed.image.url, path.join(__dirname, "../../export/img/pod.jpg")).then(() => {
							console.log("Importation : Podcast importé")

							downloadEp(feed.items.reverse(), () => {
								console.log("Importation : Terminée!")
							})

							function downloadEp(ep_tab, cb) {
								let ep = ep_tab[0];
								if (ep.itunes === undefined) ep.itunes = {};

								bdd.Episode.create({
									title: ep.title,
									description: ep.itunes.summary,
									desc_parsed: ep.content,
									pub_date: new Date(ep.pubDate),
									author: ep.itunes.author,
									guid: ep.guid,
									episode: parseInt(ep.itunes.episode),
									saison: parseInt(ep.itunes.season),
									slug: ep.guid,
									small_desc: ep.itunes.summary.substr(0, 250) + "...",
									explicit: ep.itunes.explicit === "yes",
									type: "full"
								}).then(episode => {
									download(ep.enclosure.url, path.join(__dirname, "../../export/audio/" + episode.id + ".mp3")).then(() => {
										episode.duration = convertHMS(Math.trunc(getMP3Duration(fs.readFileSync(path.join(__dirname, "../../export/audio/" + episode.id + ".mp3"))) / 1000));
										episode.enclosure = "/audio/" + episode.id + ".mp3"

										let stats = fs.statSync(path.join(__dirname, "../../export/audio/" + episode.id + ".mp3"));
										episode.size = stats.size;

										download(ep.itunes.image, path.join(__dirname, "../../export/img/" + episode.id + ".jpg")).then(() => {
											episode.img = "/img/" + episode.id + ".jpg";
											episode.save().then(() => {
												console.log("Importation : Episode " + ep.title + " importé")

												ep_tab.shift();

												if (ep_tab.length != 0) {
													downloadEp(ep_tab, cb)
												} else {
													cb();
												}
											});
										})
									})
								})
							}
						})
					})
				})
			})
			.catch(err => {
				res.status(400).send("Bad feed")
			})
	},
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
	}
}

const forbidden_slug = ["a", "about", "p", "favicon.ico", "robot.txt", "api", "rss", "audio", "public", "img", "playlists", "srt", "live"];
function checkSlug(slug) {
	return new Promise((resolve, reject) => {
		if (forbidden_slug.includes(slug)) {
			resolve(false)
		} else {
			bdd.Episode.findOne({ where: { slug: slug } }).then(episode => {
				resolve(episode === null);
			})
		}
	})
}

function convertHMS(pSec) {
	let nbSec = pSec;
	let sortie = {};
	sortie.heure = Math.trunc(nbSec / 3600);
	if (sortie.heure < 10) { sortie.heure = "0" + sortie.heure }

	nbSec = nbSec % 3600;
	sortie.minute = Math.trunc(nbSec / 60);
	if (sortie.minute < 10) { sortie.minute = "0" + sortie.minute }

	nbSec = nbSec % 60;
	sortie.seconde = Math.trunc(nbSec);
	if (sortie.seconde < 10) { sortie.seconde = "0" + sortie.seconde }

	return sortie.heure + ":" + sortie.minute + ":" + sortie.seconde
}

function orderTableByDate(a, b) {
	return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
}

function orderTableByDateInvert(a, b) {
	return new Date(a.pub_date).getTime() - new Date(b.pub_date).getTime();
}

function orderById(a, b) {
	return b.id - a.id;
}

var download = function (url, dest) {
	return new Promise((resolve, reject) => {
		axios({
			method: 'GET',
			url: url,
			responseType: 'stream'
		}).then(response => {
			response.data.pipe(fs.createWriteStream(dest))

			response.data.on('end', () => {
				resolve()
			})

			response.data.on('error', () => {
				reject()
			})
		})
	})
};