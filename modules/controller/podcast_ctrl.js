const bdd = require("../../models")
const fs = require("fs");
const path = require("path");
const pngToJpeg = require('png-to-jpeg');

module.exports = {
	get_info: (req, res) => {
		bdd.Episode.findAll().then(episodes => {
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
						audio: ep.enclosure,
						duration: ep.duration,
						img: ep.img,
						ep_number: ep.episode,
						season_number: ep.season,
						slug: ep.slug
					}

					return_obj.episodes.push(ep_obj);
				})

				res.json(return_obj);
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
						season_number: ep.season,
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
				logo: podcast.logo
			}

			res.json(return_obj);
		})
	},
	get_pod_img: (req, res) => {
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

				podcast.save().then(() => {
					res.send("OK")
				})
			})
		}
	}
}