require("dotenv").config();
const fs = require("fs");
const path = require("path");
const config = {
	host: ""
}
fs.writeFileSync(path.join(__dirname, "../src/config.json"), JSON.stringify(config, undefined, 4));

const config_player = {
	host: process.env.HOST_SITE,
	host_assets: process.env.HOST_SITE + "/player"
}

fs.writeFileSync(path.join(__dirname, "../player/src/config.json"), JSON.stringify(config_player, undefined, 4));
