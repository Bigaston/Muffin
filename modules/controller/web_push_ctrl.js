const vapid = require("../../export/vapid.json");
const bdd = require("../../models")
const planified = require("../planified")

const webpush = require("web-push");

webpush.setVapidDetails(
	process.env.HOST_SITE,
	vapid.publicKey,
	vapid.privateKey
)

module.exports = {
	vapid: (req, res) => {
		res.send(vapid.publicKey)
	},
	save: (req, res) => {
		bdd.Push.findOrCreate({ where: { data: req.body } }).then(push => {
			webpush.sendNotification(req.body, JSON.stringify({ title: "Vous êtes bien abonné!", img: "/img/pod.jpg", desc: "Vous êtes maintenant abonné aux notifications de ce podcast.", url: "/" }))

			res.send("OK");
		})
	},
	resend: (req, res) => {
		planified.episode_published_by_id(req.params.id)
		res.send("OK");
	}
}