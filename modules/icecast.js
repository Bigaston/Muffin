const bdd = require("../models")
const axios = require("axios")

module.exports = {
	connections: {},
	verif_loop: undefined,
	stream_data: { stream: false },
	init_check: () => {
		bdd.Icecast.findOne().then(icecast => {
			if (icecast !== null) {
				module.exports.verif_loop = setInterval(() => module.exports.check_stream(icecast), 1000);
			}
		})
	},
	check_stream: (icecast) => {
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
						url: icecast.url + "/" + icecast.mountpoint
					}

					console.log("Stream: ON");

					module.exports.verif_loop = setInterval(() => module.exports.check_stream_off(icecast), 1000);
					module.exports.notify_all_connections();
				}
			}
		}).catch(err => {
			console.log(err);
			clearInterval(module.exports.verif_loop);
		})
	},
	check_stream_off: (icecast) => {
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

				module.exports.verif_loop = setInterval(() => module.exports.check_stream(icecast), 1000);
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
	}
}