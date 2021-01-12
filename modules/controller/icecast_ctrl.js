const icecast = require("../icecast")
const bdd = require("../../models")
var md = require('markdown-it')({
	html: true,
	breaks: true,
	linkify: true
});

module.exports = {
	new_request: (request) => {
		if (!originIsAllowed(request.origin)) {
			request.reject();
			console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
			return;
		}


		var connection = request.accept('live', request.origin);

		icecast.connections.push(connection);
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' connected.');

		if (icecast.stream_data !== undefined) {
			connection.sendUTF(JSON.stringify(icecast.stream_data));
		}

		connection.on('close', function (reasonCode, description) {
			removeA(icecast.connections, connection)
			console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		});
	},
	get_admin_info: (req, res) => {
		bdd.Icecast.findOne().then(icecast => {
			if (icecast === null) {
				res.json({
					id: 0,
					desc_parsed: "",
					description: "",
					img: "/img/pod.jpg",
					montpoint: "",
					record_episode: false,
					small_desc: "",
					title: "",
					url: ""
				})
			} else {
				res.json(icecast)
			}
		})
	},
	save_data: (req, res) => {
		bdd.Icecast.findOne().then(ice => {
			if (ice === null) {
				bdd.Icecast.create({
					url: req.body.url,
					mountpoint: req.body.montpoint,
					title: req.body.title,
					description: req.body.description,
					desc_parsed: md.render(req.body.description),
					record_episode: req.body.record_episode,
					small_desc: req.body.small_desc,
					img: "/img/pod.jpg",
				}).then(() => {
					res.send("OK")
					icecast.init_check();
				})
			} else {
				ice.url = req.body.url;
				ice.mountpoint = req.body.mountpoint;
				ice.title = req.body.title;
				ice.description = req.body.description;
				ice.desc_parsed = md.render(req.body.description);
				ice.record_episode = req.body.record_episode;
				ice.small_desc = req.body.small_desc;


				ice.save().then(() => {
					res.send("OK");

					update(ice);
				}).catch(err => {
					console.log(err)
				})

			}

			function update(ice) {
				if (icecast.stream_data.stream) {
					icecast.stream_data = {
						stream: true,
						title: ice.title,
						description: ice.desc_parsed,
						small_desc: ice.small_desc,
						url: ice.url + "/" + ice.mountpoint,
						img: ice.img
					}
				}

				icecast.notify_all_connections();
			}
		})
	}
}

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

function removeA(arr) {
	var what, a = arguments, L = a.length, ax;
	while (L > 1 && arr.length) {
		what = a[--L];
		while ((ax = arr.indexOf(what)) !== -1) {
			arr.splice(ax, 1);
		}
	}
	return arr;
}