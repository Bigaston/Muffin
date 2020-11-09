const bdd = require("../../models")

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
						enclosure: ep.enclosure,
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
	}
}