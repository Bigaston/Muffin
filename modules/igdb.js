const axios = require("axios");

module.exports = {
	access_token: undefined,
	get_access_token: () => {
		axios({
			method: "POST",
			url: "https://id.twitch.tv/oauth2/token",
			params: {
				client_id: process.env.TWITCH_ID,
				client_secret: process.env.TWITCH_SECRET,
				grant_type: "client_credentials"
			}
		}).then(res => {
			console.log("IGDB > Access Token Récupéré")
			module.exports.access_token = res.data.access_token;
			setTimeout(module.exports.get_access_token, res.data.expires_in - 280)
		}).catch(err => {
			console.log(err);
		})
	}
}