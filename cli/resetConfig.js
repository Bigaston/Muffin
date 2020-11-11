const fs = require("fs");
const path = require("path");
const config = require("../src/config.json")
config.host = "";
fs.writeFileSync(path.join(__dirname, "../src/config.json"), JSON.stringify(config, undefined, 4));