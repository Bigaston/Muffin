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
const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/customParseFormat'))
const { Op } = require("sequelize");

module.exports = {
	get_info: (req, res) => {
		bdd.Episode.findAll({where: {
			pub_date: {
				[Op.lte]: new Date(),
			}
		}}).then(episodes => {
			bdd.Podcast.findOne().then(podcast => {
				let return_obj = {
					title: podcast.title,
					description: podcast.description,
					slogan: podcast.slogan,
					author: podcast.author,
					logo: podcast.logo,
					episodes: []
				}

				episodes.forEach(ep => {
					let ep_obj = {
						title: ep.title,
						description: ep.desc_parsed,
						small_desc: ep.small_desc,
						pub_date: ep.pub_date,
						author: ep.author,
						audio: podcast.prefix + process.env.HOST_SITE + ep.enclosure,
						duration: ep.duration,
						img: ep.img,
						ep_number: ep.episode,
						saison_number: ep.saison,
						slug: ep.slug
					}

					return_obj.episodes.push(ep_obj);
				})

				if (podcast.type === "episodic") {
					return_obj.episodes.sort(orderTableByDate)
					res.json(return_obj);
				} else if (podcast.type = "serial") {
					return_obj.episodes.sort(orderTableByDateInvert)
					res.json(return_obj);
				}

			})
		})
	},
	get_ep_info: (req, res) => {
		bdd.Episode.findAll({where: {slug: req.params.slug}}).then(episode => {
			bdd.Podcast.findOne().then(podcast => {
				let return_pod = {
					title: podcast.title,
					description: podcast.description,
					slogan: podcast.slogan,
					author: podcast.author,
					logo: podcast.logo,
				}

				if (episode.length === 0) {
					res.json({podcast: return_pod, episode: undefined})
				} else {
					let ep = episode[0];
	
					let return_ep = {
						title: ep.title,
						description: ep.desc_parsed,
						small_desc: ep.small_desc,
						pub_date: ep.pub_date,
						author: ep.author,
						audio: ep.enclosure,
						duration: ep.duration,
						img: ep.img,
						ep_number: ep.episode,
						saison_number: ep.saison,
						slug: ep.slug
					}

					res.json({episode: return_ep, podcast: return_pod})
				}
			})
		})
	},
	get_info_admin: (req, res) => {
		bdd.Podcast.findOne().then(podcast => {
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
				type: podcast.type
			}

			res.json(return_obj);
		})
	},
	edit_pod_img: (req, res) => {
		let img_buffer = new Buffer.from(req.body.image.split(/,\s*/)[1], "base64");

		if (req.body.image.startsWith("data:image/png;")) {
			pngToJpeg({quality: 90})(img_buffer)
			.then(output => {
				fs.writeFileSync(path.join(__dirname, "../../upload/img/pod.jpg"), output);
				res.send("OK");
			});
		} else {
			fs.writeFileSync(path.join(__dirname, "../../upload/img/pod.jpg"), img_buffer);
			res.send("OK");
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

				podcast.save().then(() => {
					res.send("OK")
				})
			})
		}
	},
	add_episode: (req, res) => {
		bdd.Episode.create({
			title: req.body.title,
			description: req.body.description,
			desc_parsed: md.render(req.body.description),
			small_desc: req.body.small_desc,
			pub_date: dayjs(req.body.pub_date, "DD/MM/YYYY hh:mm"),
			author: req.body.author,
			guid: Date.now(),
			type: req.body.type,
			episode: req.body.episode,
			saison: req.body.saison,
			slug: req.body.slug,
			explicit: req.body.explicit	
		}).then(ep => {
			if (req.body.img !== null) {
				let img_buffer = new Buffer.from(req.body.img.split(/,\s*/)[1], "base64");

				if (req.body.img.startsWith("data:image/png;")) {
					pngToJpeg({quality: 90})(img_buffer)
					.then(output => {
						fs.writeFileSync(path.join(__dirname, "../../upload/img/" + ep.id + ".jpg"), output);
						
						ep.img = "/img/" + ep.id + ".jpg";
						continueTraitementAddEp(ep)
					});
				} else {
					fs.writeFileSync(path.join(__dirname, "../../upload/img/" + ep.id + ".jpg"), img_buffer);
					
					ep.img = "/img/" + ep.id + ".jpg";
					continueTraitementAddEp(ep)
				}
			} else {
				ep.img = "/img/pod.jpg";
				continueTraitementAddEp(ep)
			}
		})

		function continueTraitementAddEp(ep) {
			let audio_buffer = new Buffer.from(req.body.enclosure.split(/,\s*/)[1], "base64");

			fs.writeFileSync(path.join(__dirname, "../../upload/audio/" + ep.id + ".mp3"), audio_buffer);
			ep.duration = convertHMS(Math.trunc(getMP3Duration(audio_buffer)/1000));
			ep.enclosure = "/audio/" + ep.id + ".mp3"

			let stats = fs.statSync(path.join(__dirname, "../../upload/audio/" + ep.id + ".mp3"));
			ep.size = stats.size;

			ep.save().then(() => {
				res.send("OK")
			})
		}
	},
	get_ep_list: (req, res) => {
		bdd.Episode.findAll().then(episodes => {
			let return_obj = [];
			episodes.forEach(ep => {
				let ep_obj = {
					id: ep.id,
					title: ep.title
				}

				return_obj.push(ep_obj);
			})

			return_obj.sort(orderById)
			res.json(return_obj);
		})
	},
	get_ep_info_admin: (req, res) => {
		bdd.Episode.findAll({where: {id: req.params.id}}).then(episode => {
			let ep = episode[0];

			let return_ep = {
				id: ep.id,
				title: ep.title,
				description: ep.description,
				small_desc: ep.small_desc,
				pub_date: ep.pub_date,
				author: ep.author,
				audio: ep.enclosure,
				img: ep.img,
				episode: ep.episode,
				saison: ep.saison,
				slug: ep.slug,
				explicit: ep.explicit
			}

			res.json(return_ep)
		})
	},
	edit_ep_info: (req, res) => {
		bdd.Episode.findOne({where: {id: req.body.id}}).then(episode => {
			episode.title = req.body.title
			episode.description = req.body.description
			episode.desc_parsed = md.render(req.body.description)
			episode.small_desc = req.body.small_desc
			episode.pub_date = dayjs(req.body.pub_date, "DD/MM/YYYY hh:mm")
			episode.author = req.body.author
			episode.type = req.body.type
			episode.episode = req.body.episode
			episode.saison = req.body.saison
			episode.slug = req.body.slug
			episode.explicit = req.body.explicit
			
			episode.save().then(() => {
				res.send("OK");
			})
		})
	},
	edit_ep_img: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			let img_buffer = new Buffer.from(req.body.image.split(/,\s*/)[1], "base64");

			if (req.body.image.startsWith("data:image/png;")) {
				pngToJpeg({quality: 90})(img_buffer)
				.then(output => {
					fs.writeFileSync(path.join(__dirname, "../../upload/img/" + episode.id + ".jpg"), output);
					episode.img = "/img/" + episode.id + ".jpg";
					episode.save().then(() => {
						res.send("OK");
					})
				});
			} else {
				fs.writeFileSync(path.join(__dirname, "../../upload/img/" + episode.id + ".jpg"), img_buffer);
				episode.img = "/img/" + episode.id + ".jpg";
				episode.save().then(() => {
					res.send("OK");
				})
			}
		})
	},
	delete_ep_img: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			if (fs.existsSync(path.join(__dirname, "../../upload/img/" + episode.id + ".jpg"))) {
				fs.unlinkSync(path.join(__dirname, "../../upload/img/" + episode.id + ".jpg"));
			}

			episode.img = "/img/pod.jpg";
			episode.save().then(() => {
				res.send("OK");
			})
		})
	},
	edit_ep_audio: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			let audio_buffer = new Buffer.from(req.body.enclosure.split(/,\s*/)[1], "base64");

			fs.writeFileSync(path.join(__dirname, "../../upload/audio/" + episode.id + ".mp3"), audio_buffer);
			episode.duration = convertHMS(Math.trunc(getMP3Duration(audio_buffer)/1000));
			episode.enclosure = "/audio/" + episode.id + ".mp3"
	
			let stats = fs.statSync(path.join(__dirname, "../../upload/audio/" + episode.id + ".mp3"));
			episode.size = stats.size;
	
			episode.save().then(() => {
				res.send("OK")
			})
		})
	},
	delete_episode: (req, res) => {
		bdd.Episode.findByPk(req.params.id).then(episode => {
			if (episode.img !== "/img/pod.jpg" && fs.existsSync(path.join(__dirname, "../../upload/img/" + episode.id + ".jpg"))) {
				fs.unlinkSync(path.join(__dirname, "../../upload/img/" + episode.id + ".jpg"));
			}

			fs.unlinkSync(path.join(__dirname, "../../upload/audio/" + episode.id + ".mp3"));
			episode.destroy().then(() => {
				res.send("OK");
			})
		})
	}
}

function convertHMS(pSec) {
    let nbSec = pSec;
    let sortie = {};
    sortie.heure = Math.trunc(nbSec/3600);
    if (sortie.heure < 10) {sortie.heure = "0"+sortie.heure}

    nbSec = nbSec%3600;
    sortie.minute = Math.trunc(nbSec/60);
    if (sortie.minute < 10) {sortie.minute = "0"+sortie.minute}

    nbSec = nbSec%60;
    sortie.seconde = Math.trunc(nbSec);
    if (sortie.seconde < 10) {sortie.seconde = "0"+sortie.seconde}

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