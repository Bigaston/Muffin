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
						enclosure: ep.enclosure,
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
	}
}