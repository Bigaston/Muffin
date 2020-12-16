var RSS = require("rss");
var bdd = require("../../models");
const { Op } = require("sequelize");

module.exports = {
	create_rss: (req, res) => {
		bdd.Episode.findAll({
			where: {
				pub_date: {
					[Op.lte]: new Date(),
				}
			}
		}).then(episodes => {
			bdd.Podcast.findOne().then(podcast => {
				if (podcast.type === "episodic") {
					episodes.sort(orderTableByDate)
				} else if (podcast.type = "serial") {
					episodes.sort(orderTableByDateInvert)
				}

				let rss_obj = {
					title: podcast.title,
					description: podcast.description,
					generator: "Muffin (https://muffin.pm)",
					feed_url: process.env.HOST_SITE + "/rss",
					site_url: process.env.HOST_SITE,
					image_url: process.env.HOST_SITE + "/img/pod.jpg",
					copyright: podcast.author,
					language: "fr",
					custom_namespaces: {
						'itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
						"google": "http://www.google.com/schemas/play-podcasts/1.0",
						"podext": "https://podcast-ext.org"
					},
					custom_elements: [
						{ "itunes:author": podcast.author },
						{
							"itunes:owner": [
								{ "itunes:email": podcast.email }
							]
						},
						{
							"itunes:category": [
								{
									_attr: {
										text: podcast.itunes_category
									}
								},
								{
									'itunes:category': {
										_attr: {
											text: podcast.itunes_subcategory
										}
									}
								}
							]
						},
						{ "itunes:summary": podcast.description },
						{ "itunes:subtitle": podcast.slogan },
						{ "itunes:type": podcast.type },
						{
							"itunes:image": [
								{
									_attr: {
										href: process.env.HOST_SITE + "/img/pod.jpg"
									}
								}
							]
						},
						{ "itunes:explicit": podcast.explicit ? "yes" : "no" },
						{
							"link": [
								{
									_attr: {
										rel: "payment",
										href: podcast.data.donation
									}
								}
							]
						}
					]
				}

				if (!!podcast.data.donation) {
					rss_obj.custom_elements.push({
						"podext:donate": [
							{
								_attr: {
									href: podcast.data.donation
								}
							}
						]
					})
				}

				if (!!podcast.data.twitter) {
					rss_obj.custom_elements.push({
						"podext:social": [
							{
								_attr: {
									platform: "twitter",
									href: podcast.data.twitter
								}
							}
						]
					})
				}

				if (!!podcast.data.youtube) {
					rss_obj.custom_elements.push({
						"podext:social": [
							{
								_attr: {
									platform: "youtube",
									href: podcast.data.youtube
								}
							}
						]
					})
				}

				if (!!podcast.data.instagram) {
					rss_obj.custom_elements.push({
						"podext:social": [
							{
								_attr: {
									platform: "instagram",
									href: podcast.data.instagram
								}
							}
						]
					})
				}

				if (!!podcast.data.apple_podcast) {
					rss_obj.custom_elements.push({
						"podext:platform": [
							{
								_attr: {
									platform: "apple_podcasts",
									href: podcast.data.apple_podcast
								}
							}
						]
					})
				}

				if (!!podcast.data.spotify) {
					rss_obj.custom_elements.push({
						"podext:platform": [
							{
								_attr: {
									platform: "spotify",
									href: podcast.data.spotify
								}
							}
						]
					})
				}

				if (!!podcast.data.google_podcast) {
					rss_obj.custom_elements.push({
						"podext:platform": [
							{
								_attr: {
									platform: "google_podcasts",
									href: podcast.data.google_podcast
								}
							}
						]
					})
				}

				if (!!podcast.data.deezer) {
					rss_obj.custom_elements.push({
						"podext:platform": [
							{
								_attr: {
									platform: "deezer",
									href: podcast.data.deezer
								}
							}
						]
					})
				}

				if (!!podcast.data.podcast_addict) {
					rss_obj.custom_elements.push({
						"podext:platform": [
							{
								_attr: {
									platform: "podcast_addict",
									href: podcast.data.podcast_addict
								}
							}
						]
					})
				}

				if (!!podcast.data.podcloud) {
					rss_obj.custom_elements.push({
						"podext:platform": [
							{
								_attr: {
									platform: "podcloud",
									href: podcast.data.podcloud
								}
							}
						]
					})
				}

				var feed = new RSS(rss_obj)

				episodes.forEach(ep => {
					let enclosure;
					if (!!podcast.prefix) {
						enclosure = podcast.prefix + process.env.HOST_SITE.replace("https://", "").replace("http://", "") + ep.enclosure;
					} else {
						enclosure = process.env.HOST_SITE + ep.enclosure
					}

					feed.item({
						title: ep.title,
						description: ep.desc_parsed,
						url: process.env.HOST_SITE + "/" + ep.slug,
						guid: ep.guid,
						author: ep.author,
						date: new Date(ep.pub_date),
						custom_elements: [
							{ 'itunes:author': ep.author },
							{ 'itunes:summary': ep.description },
							{
								'itunes:image': {
									_attr: {
										href: process.env.HOST_SITE + ep.img
									}
								}
							},
							{ 'itunes:duration': ep.duration },
							{ "itunes:episodeType": ep.type },
							{ "itunes:explicit": ep.explicit ? "yes" : "no" },
							{ "itunes:season": ep.saison },
							{ "itunes:episode": ep.episode },
							{
								"enclosure": {
									_attr: {
										url: enclosure,
										type: "audio/mpeg",
										length: ep.size
									}
								}
							}
						]
					})
				})

				res.set('Content-Type', 'text/xml');
				res.send(feed.xml({ indent: true }));
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