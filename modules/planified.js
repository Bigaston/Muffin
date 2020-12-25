const bdd = require("../models");
const axios = require("axios");

module.exports = {
	check_planified: () => {
		bdd.Planified.findAll().then(plans => {
			plans.forEach(plan => {
				if (plan.date < new Date()) {
					module.exports.episode_published_by_id(plan.EpisodeId);
					plan.destroy();
				}
			});
		})
	},
	episode_published_by_id: (id) => {
		bdd.Episode.findByPk(id).then(episode => {
			module.exports.send_webhooks(episode)
		})
	},
	episode_published: (episode) => {
		module.exports.send_webhooks(episode)
	},
	send_webhooks: (episode) => {
		bdd.DiscordWebhook.findAll().then(whs => {
			bdd.Podcast.findOne().then(podcast => {
				whs.forEach(wh => {
					axios({
						method: "POST",
						url: wh.url,
						data: {
							"username": podcast.title,
							"avatar_url": process.env.HOST_SITE + podcast.logo,
							"embeds":
								[{
									"author": {
										"name": podcast.title,
										"url": process.env.HOST_SITE
									},
									"description": episode.title,
									"color": 16098851,
									"timestamp": 0,
									"thumbnail": {
										"url": process.env.HOST_SITE + episode.img
									},
									"fields": [
										{
											"name": "Description",
											"value": episode.small_desc
										},
										{
											"name": "Posté par",
											"value": podcast.author,
											"inline": true
										},
										{
											"name": "Ecouter l'épisode",
											"value": "[Lien](" + process.env.HOST_SITE + "/p/" + episode.slug + ")",
											"inline": true
										}
									]
								}]
						}
					}).catch(err => {
						console.log(err)
					})
				})
			})
		})

	}
}