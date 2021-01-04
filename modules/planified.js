const bdd = require("../models");
const axios = require("axios");
const webpush = require("web-push");
const vapid = require("../export/vapid.json")

webpush.setVapidDetails(
	process.env.HOST_SITE,
	vapid.publicKey,
	vapid.privateKey
)

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
			module.exports.send_push(episode)
		})
	},
	episode_published: (episode) => {
		module.exports.send_webhooks(episode)
		module.exports.send_push(episode)
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
											"value": "[Lien](" + process.env.HOST_SITE + "/" + episode.slug + ")",
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

	},
	send_push: (episode) => {
		bdd.Push.findAll().then(pushs => {
			pushs.forEach(p => {
				webpush.sendNotification(p.data, JSON.stringify({ title: episode.title, img: episode.img, desc: episode.small_desc, url: "/" + episode.slug })).then(result => {
				}).catch(err => {
					if (err.statusCode === 410) {
						p.destroy()
					}
				})
			})
		})
	}
}