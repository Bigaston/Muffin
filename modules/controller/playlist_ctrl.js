const bdd = require("../../models")
const fs = require("fs");
const path = require("path")
const pngToJpeg = require('png-to-jpeg');

module.exports = {
	check_slug: (req, res) => {
		if (!!req.params.slug) {
			checkSlug(req.params.slug).then(ok_slug => {
				if (ok_slug) {
					res.json({ ok: true })
				} else {
					res.json({ ok: false })
				}
			})
		} else {
			res.json({ ok: false })
		}
	},
	add_playlist: (req, res) => {
		checkSlug(req.body.slug).then(ok_slug => {
			if (ok_slug) {

				bdd.Playlist.create({
					title: req.body.title,
					description: req.body.description,
					slug: req.body.slug,
				}).then(pl => {
					if (req.body.img !== null) {
						let img_buffer = new Buffer.from(req.body.img.split(/,\s*/)[1], "base64");

						if (req.body.img.startsWith("data:image/png;")) {
							pngToJpeg({ quality: 90 })(img_buffer)
								.then(output => {
									fs.writeFileSync(path.join(__dirname, "../../upload/img/playlist_" + pl.id + ".jpg"), output);

									pl.img = "/img/playlist_" + pl.id + ".jpg";
									pl.save().then(() => {
										res.send("OK");
									})
								});
						} else {
							fs.writeFileSync(path.join(__dirname, "../../upload/img/playlist_" + pl.id + ".jpg"), img_buffer);

							pl.img = "/img/playlist_" + pl.id + ".jpg";
							pl.save().then(() => {
								res.send("OK");
							})
						}
					} else {
						pl.img = "/img/pod.jpg";
						pl.save().then(() => {
							res.send("OK");
						})
					}
				})
			} else {
				res.status(400).send("Bad Slug")
			}
		})
	},
}

function checkSlug(slug) {
	return new Promise((resolve, reject) => {
		bdd.Playlist.findOne({ where: { slug: slug } }).then(episode => {
			resolve(episode === null);
		})
	})
}