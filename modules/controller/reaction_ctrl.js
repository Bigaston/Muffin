const bdd = require("../../models")
const sequelize = require("sequelize")
const crypto = require("crypto")

const EMOJI_REGEX = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

module.exports = {
	get_admin_react: (req, res) => {
		bdd.Reaction.findAll().then((reactions) => {
			res.json(reactions);
		})
	},
	add_reaction: (req, res) => {
		if (req.body.emoji.match(EMOJI_REGEX).length !== 0) {
			bdd.Reaction.create({
				emoji: req.body.emoji,
				name: req.body.name
			}).then(react => {
				res.send("OK");
			})
		}
	},
	delete_reaction: (req, res) => {
		bdd.Reaction.findByPk(req.params.id).then(reac => {
			reac.destroy().then(() => {
				res.send("OK");
			})
		})
	},
	update_reaction: (req, res) => {
		bdd.Reaction.findByPk(req.params.id).then(reac => {
			reac.emoji = req.body.emoji;
			reac.name = req.body.name;
			reac.save().then(() => {
				res.send("OK");
			})
		})
	},
	get_reaction: (req, res) => {
		bdd.Reaction.findAll().then(reactions => {
			bdd.Episode.findOne({ where: { slug: req.params.slug } }).then(ep => {
				if (ep !== null) {
					bdd.UserReaction.findOne({ where: { fingerprint: req.params.fingerprint, EpisodeId: ep.id }, attributes: ["ReactionId"] }).then(user_reaction => {
						bdd.UserReaction.findAll({ where: { EpisodeId: ep.id }, group: ["ReactionId"], attributes: ["ReactionId", [sequelize.fn('COUNT', 'ReactionId'), "count"]] }).then(episode_reactions => {
							res.json({ reactions, user_reaction: user_reaction, episode_reactions })
						})
					})
				} else {
					res.status(404).send("Not fount")
				}

			})
		})
	},
	post_reaction: (req, res) => {
		bdd.Episode.findOne({ where: { slug: req.body.slug } }).then(ep => {
			if (ep === null) {
				res.status(400).send("Episode not exist")
			} else {
				bdd.Reaction.findByPk(req.body.reaction).then(reac => {
					if (reac === null) {
						res.status(400).send("Reaction not exist")

					} else {
						bdd.UserReaction.findOne({ where: { EpisodeId: ep.id, fingerprint: req.body.fingerprint } }).then(user_reaction => {
							if (user_reaction !== null) {
								if (user_reaction.ReactionId === req.body.reaction) {
									user_reaction.destroy().then(() => {
										res.send("OK")
									})
								} else {
									user_reaction.ReactionId = req.body.reaction;
									user_reaction.save().then(() => {
										res.send("OK");
									})
								}
							} else {
								let shaUA = crypto.createHash('sha256').update(req.get('user-agent')).digest("hex")
								let shaIP = crypto.createHash('sha256').update(req.ip).digest("hex");

								bdd.UserReaction.count({ where: { EpisodeId: ep.id, useragent: shaUA } }).then(countUA => {
									if (countUA > 10) {
										res.status(400).send("To Many Request")
									} else {
										bdd.UserReaction.count({ where: { EpisodeId: ep.id, ip: shaIP } }).then(countIP => {
											if (countIP > 25) {
												res.status(400).send("To Many Request")
											} else {
												bdd.UserReaction.create({
													ReactionId: req.body.reaction,
													EpisodeId: ep.id,
													fingerprint: req.body.fingerprint,
													useragent: shaUA,
													ip: shaIP
												}).then(() => {
													res.send("OK")
												})
											}
										})
									}
								})
							}
						})
					}
				})
			}
		})
	},
	get_user_reaction: (req, res) => {
		bdd.UserReaction.findAll({ group: ["EpisodeId", "ReactionId"], attributes: ["EpisodeId", "ReactionId", [sequelize.fn('COUNT', 'ReactionId'), "count"]] }).then(user_reactions => {
			bdd.Reaction.findAll().then(reactions => {
				bdd.Episode.findAll({ attributes: ["id", "title"] }).then(episodes => {
					let return_episode = [];
					for (let i = 0; i < episodes.length; i++) {
						let ep = {};
						ep.id = episodes[i].id;
						ep.title = episodes[i].title;

						reactions.forEach(r => {
							let reac = getUserReaction(user_reactions, episodes[i].id, r.id);

							if (reac === null) {
								ep[r.emoji] = 0;
							} else {
								ep[r.emoji] = reac.dataValues.count;
							}
						})

						return_episode.push(ep);
					}

					res.json(return_episode)
				})
			})
		})
	}
}

function getUserReaction(user_reactions, EpisodeId, ReactionId) {
	let i = 0;
	let result = null;

	while (i < user_reactions.length && result === null) {
		if (user_reactions[i].EpisodeId === EpisodeId && user_reactions[i].ReactionId === ReactionId) {
			result = user_reactions[i];
		} else {
			i++;
		}
	}

	return result;
} 