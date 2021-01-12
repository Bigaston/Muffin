const fs = require("fs");
const path = require("path");
const bdd = require("../../models");

module.exports = {
	send_index_podcast: (req, res) => {
		let base_index = fs.readFileSync(path.join(__dirname, "../../build", "index.html"), "utf-8");

		bdd.Podcast.findOne().then(podcast => {
			let tags = `<meta property="og:title" content="${podcast.title}"></meta>
			<meta property="og:site_name" content="${podcast.title}"></meta>
			<meta property="og:description" content="${podcast.description.replace(/\n/g, " ")}"></meta>
			<meta name="description" content="${podcast.description.replace(/\n/g, " ")}"></meta>
			<meta property="og:type" content="blog"></meta>
			<meta property="og:image" content="${process.env.HOST_SITE + "/img/pod.jpg"}"></meta>
			<meta property="og:url" content="${process.env.HOST_SITE}"></meta>
			<meta property="theme-color" content="#edbb9a"></meta>
			<link href="${process.env.HOST_SITE + "/rss"}" rel="alternate" type="application/rss+xml" title="${podcast.title}"></link>`

			base_index = base_index.replace('<title>Muffin</title>', `<title>${podcast.title}</title>\n${tags}`);

			res.setHeader("content-type", "text/html");
			res.send(base_index);
		})
	},
	send_index_epispde: (req, res) => {
		let base_index = fs.readFileSync(path.join(__dirname, "../../build", "index.html"), "utf-8");

		bdd.Podcast.findOne().then(podcast => {
			bdd.Episode.findOne({ where: { slug: req.params.slug } }).then(episode => {
				if (episode === null) {
					let tags = `<meta property="og:title" content="${"Episode non trouvé - " + podcast.title}"></meta>
					<meta property="og:site_name" content="${podcast.title}"></meta>
					<meta property="og:description" content="${podcast.description.replace(/\n/g, " ")}"></meta>
					<meta name="description" content="${podcast.description.replace(/\n/g, " ")}"></meta>
					<meta property="og:type" content="blog"></meta>
					<meta property="og:image" content="${process.env.HOST_SITE + "/img/pod.jpg"}"></meta>
					<meta property="og:url" content="${process.env.HOST_SITE}"></meta>
					<meta property="theme-color" content="#edbb9a"></meta>
					<link href="${process.env.HOST_SITE + "/rss"}" rel="alternate" type="application/rss+xml" title="${podcast.title}"></link>`

					base_index = base_index.replace('<title>Muffin</title>', `<title>${"Episode non trouvé - " + podcast.title}</title>\n${tags}`);

					res.setHeader("content-type", "text/html");
					res.send(base_index);
				} else {
					let tags = `<meta property="og:title" content="${episode.title + " - " + podcast.title}"></meta>
					<meta property="og:site_name" content="${podcast.title}"></meta>
					<meta property="og:description" content="${episode.small_desc.replace(/\n/g, " ")}"></meta>
					<meta name="description" content="${episode.small_desc.replace(/\n/g, " ")}"></meta>
					<meta property="og:type" content="blog"></meta>
					<meta property="og:image" content="${process.env.HOST_SITE + episode.img}"></meta>
					<meta property="og:url" content="${process.env.HOST_SITE}"></meta>
					<meta property="theme-color" content="#edbb9a"></meta>
					<link href="${process.env.HOST_SITE + "/rss"}" rel="alternate" type="application/rss+xml" title="${podcast.title}"></link>`

					base_index = base_index.replace('<title>Muffin</title>', `<title>${episode.title + " - " + podcast.title}</title>\n${tags}`);

					res.setHeader("content-type", "text/html");
					res.send(base_index);
				}
			})
		})
	},
	send_index_playlist: (req, res) => {
		let base_index = fs.readFileSync(path.join(__dirname, "../../build", "index.html"), "utf-8");
		bdd.Podcast.findOne().then(podcast => {

			bdd.Playlist.findOne({ where: { slug: req.params.slug } }).then(playlist => {
				if (playlist === null) {
					let tags = `<meta property="og:title" content="${"Playlist non trouvée - " + podcast.title}"></meta>
					<meta property="og:site_name" content="${podcast.title}"></meta>
					<meta property="og:description" content="${podcast.description.replace(/\n/g, " ")}"></meta>
					<meta name="description" content="${podcast.description.replace(/\n/g, " ")}"></meta>
					<meta property="og:type" content="blog"></meta>
					<meta property="og:image" content="${process.env.HOST_SITE + "/img/pod.jpg"}"></meta>
					<meta property="og:url" content="${process.env.HOST_SITE}"></meta>
					<meta property="theme-color" content="#edbb9a"></meta>
					<link href="${process.env.HOST_SITE + "/rss"}" rel="alternate" type="application/rss+xml" title="${podcast.title}"></link>`

					base_index = base_index.replace('<title>Muffin</title>', `<title>${"Playlist non trouvée - " + podcast.title}</title>\n${tags}`);

					res.setHeader("content-type", "text/html");
					res.send(base_index);
				} else {
					let tags = `<meta property="og:title" content="${playlist.title + " - " + podcast.title}"></meta>
					<meta property="og:site_name" content="${podcast.title}"></meta>
					<meta property="og:description" content="${playlist.description.replace(/\n/g, " ")}"></meta>
					<meta name="description" content="${playlist.description.replace(/\n/g, " ")}"></meta>
					<meta property="og:type" content="blog"></meta>
					<meta property="og:image" content="${process.env.HOST_SITE + playlist.img}"></meta>
					<meta property="og:url" content="${process.env.HOST_SITE}"></meta>
					<meta property="theme-color" content="#edbb9a"></meta>
					<link href="${process.env.HOST_SITE + "/rss"}" rel="alternate" type="application/rss+xml" title="${podcast.title}"></link>`

					base_index = base_index.replace('<title>Muffin</title>', `<title>${playlist.title + " - " + podcast.title}</title>\n${tags}`);

					res.setHeader("content-type", "text/html");
					res.send(base_index);
				}
			})
		})
	},
	send_index_live: (req, res) => {
		let base_index = fs.readFileSync(path.join(__dirname, "../../build", "index.html"), "utf-8");

		bdd.Podcast.findOne().then(podcast => {
			let tags = `<meta property="og:title" content="Live - ${podcast.title}"></meta>
			<meta property="og:site_name" content="${podcast.title}"></meta>
			<meta property="og:description" content="Retrouvez sur cette page le live du podcast ${podcast.title}"></meta>
			<meta name="description" content="Retrouvez sur cette page le live du podcast ${podcast.title}"></meta>
			<meta property="og:type" content="blog"></meta>
			<meta property="og:image" content="${process.env.HOST_SITE + "/img/pod.jpg"}"></meta>
			<meta property="og:url" content="${process.env.HOST_SITE}"></meta>
			<meta property="theme-color" content="#edbb9a"></meta>
			<link href="${process.env.HOST_SITE + "/rss"}" rel="alternate" type="application/rss+xml" title="${podcast.title}"></link>`

			base_index = base_index.replace('<title>Muffin</title>', `<title>${podcast.title}</title>\n${tags}`);

			res.setHeader("content-type", "text/html");
			res.send(base_index);
		})
	},
	send_index: (req, res) => {
		res.sendFile(path.join(__dirname, '../../build', 'index.html'));
	}
}