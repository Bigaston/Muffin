const bdd = require("../models")
const axios = require("axios")
const http = require("http");
const fs = require("fs");
const path = require("path");
const getMP3Duration = require('get-mp3-duration')

module.exports = {
	connections: {},
	verif_loop: undefined,
	stream_data: { stream: false },
	icecast: undefined,
	init_check: () => {
		bdd.Icecast.findOne().then(icecast => {
			if (icecast !== null) {
				module.exports.icecast = icecast;
				module.exports.verif_loop = setInterval(module.exports.check_stream, 1000);
			}
		})
	},
	check_stream: () => {
		let icecast = module.exports.icecast;
		const check_source = new RegExp(icecast.mountpoint + "$")

		axios({
			method: "GET",
			url: icecast.url + "/status-json.xsl"
		}).then(res => {
			if (res.data.icestats.source === undefined) return;

			if (Array.isArray(res.data.icestats.source)) {
				res.data.icestats.source.forEach(checkSource);
			} else {
				checkSource(res.data.icestats.source)
			}

			function checkSource(source) {
				if (source.listenurl.match(check_source) !== null) {
					clearInterval(module.exports.verif_loop);
					module.exports.stream_data = {
						stream: true,
						title: icecast.title,
						description: icecast.desc_parsed,
						small_desc: icecast.small_desc,
						url: icecast.url + "/" + icecast.mountpoint,
						img: icecast.img
					}

					console.log("Stream: ON");

					if (icecast.record_episode) {
						module.exports.record_stream();
					}

					module.exports.verif_loop = setInterval(module.exports.check_stream_off, 1000);
					module.exports.notify_all_connections();
				}
			}
		}).catch(err => {
			console.log(err);
			clearInterval(module.exports.verif_loop);
		})
	},
	check_stream_off: () => {
		let icecast = module.exports.icecast;

		const check_source = new RegExp(icecast.mountpoint + "$")

		axios({
			method: "GET",
			url: icecast.url + "/status-json.xsl"
		}).then(res => {
			if (res.data.icestats.source === undefined) {
				stopStream();
				return;
			};

			if (Array.isArray(res.data.icestats.source)) {
				res.data.icestats.source.forEach(checkSource);
			} else {
				checkSource(res.data.icestats.source)
			}

			function checkSource(source) {
				if (source.listenurl.match(check_source) === null) {
					stopStream();
					return;
				}
			}

			function stopStream() {
				clearInterval(module.exports.verif_loop);
				module.exports.stream_data = { stream: false };

				console.log("Stream: OFF");

				module.exports.verif_loop = setInterval(module.exports.check_stream, 1000);
				module.exports.notify_all_connections();
			}
		}).catch(err => {
			console.log(err);
			clearInterval(module.exports.verif_loop);
		})
	},
	notify_all_connections: () => {
		let keys = Object.keys(module.exports.connections);

		keys.forEach(k => {
			let co = module.exports.connections[k];

			co.sendUTF(JSON.stringify(module.exports.stream_data));
		})
	},
	record_stream: () => {
		let icecast = module.exports.icecast;
		let fichier_name = Date.now() + ".mp3";

		let file = fs.createWriteStream(path.join(__dirname, "../temp/" + fichier_name))
		http.get(icecast.url + "/" + icecast.mountpoint, function (response) {
			response.pipe(file);
		});

		file.on("close", () => {
			bdd.Podcast.findOne().then(podcast => {
				bdd.Episode.create({
					title: "Enregistrement de live du " + new Date().toString(),
					description: icecast.description,
					desc_parsed: icecast.desc_parsed,
					small_desc: icecast.small_desc,
					pub_date: new Date("2100-01-01T01:01:00"),
					author: podcast.author,
					guid: Date.now(),
					type: "full",
					episode: 0,
					saison: 0,
					slug: Date.now(),
					explicit: false,
					transcript: "",
					img: "/img/pod." + Date.now() + ".jpg"
				}).then(ep => {
					fs.copyFileSync(path.join(__dirname, "../temp/" + fichier_name), path.join(__dirname, "../export/audio/" + ep.id + ".mp3"))
					fs.unlinkSync(path.join(__dirname, "../temp/" + fichier_name))
					let audio_buffer = new Buffer.from(fs.readFileSync(path.join(__dirname, "../export/audio/" + ep.id + ".mp3")));

					ep.duration = convertHMS(Math.trunc(getMP3Duration(audio_buffer) / 1000));
					ep.enclosure = "/audio/" + ep.id + "." + Date.now() + ".mp3"

					let stats = fs.statSync(path.join(__dirname, "../export/audio/" + ep.id + ".mp3"));
					ep.size = stats.size;

					ep.save().then(() => {
						bdd.Planified.create({
							EpisodeId: ep.id,
							date: new Date("2100-01-01T01:01:00")
						}).then(() => {
							console.log("Live enregistré!")
						})
					})
				})
			})

		})
	}
}

function convertHMS(pSec) {
	let nbSec = pSec;
	let sortie = {};
	sortie.heure = Math.trunc(nbSec / 3600);
	if (sortie.heure < 10) { sortie.heure = "0" + sortie.heure }

	nbSec = nbSec % 3600;
	sortie.minute = Math.trunc(nbSec / 60);
	if (sortie.minute < 10) { sortie.minute = "0" + sortie.minute }

	nbSec = nbSec % 60;
	sortie.seconde = Math.trunc(nbSec);
	if (sortie.seconde < 10) { sortie.seconde = "0" + sortie.seconde }

	return sortie.heure + ":" + sortie.minute + ":" + sortie.seconde
}