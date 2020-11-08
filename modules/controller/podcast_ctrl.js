const bdd = require("../../models")

module.exports = {
	get_all_episodes: (req, res) => {
		bdd.Episode.findAll().then(episodes => {
			console.log(episodes)
		})
	}
}