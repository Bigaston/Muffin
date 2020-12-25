const bdd = require("../../models")

module.exports = {
	get_all_webhooks: (req, res) => {
		bdd.DiscordWebhook.findAll({ attributes: ["id", "name", "url"] }).then(webhooks => {
			res.json(webhooks)
		})
	},
	create: (req, res) => {
		bdd.DiscordWebhook.create({
			name: req.body.name,
			url: req.body.url
		}).then(() => {
			res.send("OK");
		})
	},
	edit: (req, res) => {
		bdd.DiscordWebhook.findByPk(req.params.id).then(wh => {
			wh.url = req.body.url;
			wh.name = req.body.name;
			wh.save().then(() => {
				res.send("OK");
			})
		})
	},
	delete: (req, res) => {
		bdd.DiscordWebhook.findByPk(req.params.id).then(wh => {
			wh.destroy().then(() => {
				res.send("OK");
			})
		})
	}
}