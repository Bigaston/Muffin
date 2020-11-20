const fs = require("fs")
const path = require("path")

if (!fs.existsSync(path.join(__dirname, "../export"))) {
	fs.mkdirSync(path.join(__dirname, "../export"));
}

if (!fs.existsSync(path.join(__dirname, "../export/img"))) {
	fs.mkdirSync(path.join(__dirname, "../export/img"));
}

if (!fs.existsSync(path.join(__dirname, "../export/audio"))) {
	fs.mkdirSync(path.join(__dirname, "../export/audio"));
}