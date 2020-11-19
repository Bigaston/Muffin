const bdd = require("../../models")
const path = require("path")
const { Op } = require("sequelize");

module.exports = {
	episode_by_slug: (req, res) => {
		bdd.Episode.findOne({
			where: {
				slug: req.params.slug, pub_date: {
					[Op.lte]: new Date(),
				}
			}, attributes: ['title', 'slug', 'enclosure', 'duration', 'img']
		}).then(episode => {
			bdd.Episode.findAll({
				attributes: ['title', 'slug', 'enclosure', 'duration', 'img'], where: {
					pub_date: {
						[Op.lte]: new Date(),
					}
				}
			}).then(episode_list => {
				bdd.Podcast.findOne({ attributes: ["title", "type", "logo"] }).then(podcast => {
					if (podcast.type === "episodic") {
						episode_list = episode_list.reverse()
					}

					if (episode === null) {
						episode = {
							title: "Cet épisode n'existe pas :/",
							slug: "",
							enclosure: "/audio/404",
							duration: "00:00:00",
							img: podcast.logo,
						}

					}

					res.json({ episode: episode, episode_list: episode_list, podcast: podcast });
				})
			})
		})
	},
	last_episode: (req, res) => {
		bdd.Episode.findAll({
			limit: 1, order: [['createdAt', 'DESC']], attributes: ['title', 'slug', 'enclosure', 'duration', 'img'], where: {
				pub_date: {
					[Op.lte]: new Date(),
				}
			}
		}).then(episodes => {
			let episode = episodes[0];
			bdd.Episode.findAll({ attributes: ['title', 'slug', 'enclosure', 'duration', 'img'] }).then(episode_list => {
				bdd.Podcast.findOne({ attributes: ["title", "type"] }).then(podcast => {
					if (podcast.type === "episodic") {
						episode_list = episode_list.reverse()
					}

					res.json({ episode: episode, episode_list: episode_list, podcast: podcast });
				})
			})
		})
	},
	send_index: (req, res) => {
		res.sendFile(path.join(__dirname, "../../player/build/index.html"));
	}
}