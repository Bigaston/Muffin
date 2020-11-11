var RSS = require("rss");
var bdd = require("../../models");
const { Op } = require("sequelize");

module.exports = {
	create_rss: (req, res) => {
		bdd.Episode.findAll({where: {
			pub_date: {
				[Op.lte]: new Date(),
			}
		}}).then(episodes => {
			bdd.Podcast.findOne().then(podcast => {
				if (podcast.type === "episodic") {
					episodes.sort(orderTableByDate)
				} else if (podcast.type = "serial") {
					episodes.sort(orderTableByDateInvert)
				}

				var feed = new RSS({
					title: podcast.title,
					description: podcast.description,
					generator: "Muffin (https://muffin.pm)",
					feed_url: process.env.HOST + "/rss",
					site_url: process.env.HOST,
					image_url: process.env.HOST + "/img/pod.jpg",
					copyright: podcast.author,
					language: "fr",
					custom_namespaces: {
						'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
						"google": "http://www.google.com/schemas/play-podcasts/1.0"
					},
					custom_elements: [
						{"itunes:author" : podcast.author},
						{"itunes:owner" : [
							{"itunes:email" : podcast.email}
						]},
						{"itunes:category" : [
							{_attr: {
								text: podcast.itunes_category
							}},
							{'itunes:category': {
								_attr: {
									text: podcast.itunes_subcategory
								}
							}}
						]},
						{"itunes:summary": podcast.description},
						{"itunes:subtitle": podcast.slogan},
						{"itunes:type" : podcast.type},
						{"itunes:image": [
							{_attr: {
								href: process.env.HOST + "/img/pod.jpg"
							}}
						]},
						{"itunes:explicit" : podcast.explicit}
					]
				})

				episodes.forEach(ep => {
					feed.item({
						title: ep.title,
						description: ep.desc_parsed,
						url: process.env.HOST + "/" + ep.slug,
						guid: ep.guid,
						author: ep.author,
						date: new Date(ep.pub_date),
						custom_elements: [
							{'itunes:author': ep.author},
							{'itunes:summary': ep.description},
							{'itunes:image': {
							_attr: {
								href: process.env.HOST + ep.img
							}
							}},
							{'itunes:duration': ep.duration},
							{"itunes:episodeType": ep.type},
							{"itunes:explicit" : ep.explicit},
							{"itunes:season": ep.saison},
							{"itunes:episode": ep.episode},
							{"enclosure" : {
								_attr: {
									url: podcast.prefix + process.env.HOST + ep.enclosure,
									type: "audio/mpeg",
									length: ep.size
								}
							}}
						]
					})
				})

				res.set('Content-Type', 'text/xml');
				res.send(feed.xml({indent: true}));
			}) 
		})

	}
}

function orderTableByDate(a, b) {
	return new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime();
}

function orderTableByDateInvert(a, b) {
	return new Date(a.pub_date).getTime() - new Date(b.pub_date).getTime();
}