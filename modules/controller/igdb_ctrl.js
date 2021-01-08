const axios = require("axios");
const igdb = require("../igdb");

module.exports = {
	search_game: (req, res) => {
		if (!!req.body.name) {
			axios({
				url: "https://api.igdb.com/v4/games",
				data: `search "${req.body.name}"; fields id,name,cover,summary;`,
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Client-ID': process.env.TWITCH_ID,
					'Authorization': 'Bearer ' + igdb.access_token
				},
			})
				.then(response => {
					if (response.data.length === 0) {
						res.json([]);
						return;
					}

					let tab = [];
					response.data.forEach(g => { if (g.cover !== undefined) tab.push(g.cover) })
					let cover_string = "(" + tab.join(",") + ")";

					axios({
						url: "https://api.igdb.com/v4/covers",
						data: `where id=${cover_string}; fields id,url,image_id;`,
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Client-ID': process.env.TWITCH_ID,
							'Authorization': 'Bearer ' + igdb.access_token
						},
					}).then(response2 => {
						let response_data = [];
						let cover_tab = {};
						let image_id = {};

						response2.data.forEach(c => {
							cover_tab[c.id] = c.url;
							image_id[c.id] = c.image_id;
						})

						response.data.forEach(g => {
							response_data.push({
								id: g.id,
								name: g.name,
								summary: g.summary,
								cover: cover_tab[g.cover],
								image_id: image_id[g.cover]
							})
						})

						res.json(response_data);
					}).catch(err => {
						console.log(err);
					})
				})
				.catch(err => {
					console.error(err);
				});
		} else {
			res.json([]);
		}
	},
	can_use: (req, res) => {
		res.json(igdb.access_token !== undefined)
	}
}