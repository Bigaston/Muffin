const fs = require("fs")
const path = require("path")
const generator = require('generate-password');

console.log("Création des fichiers de base")

if (!fs.existsSync(path.join(__dirname, "../.env"))) {
	fs.writeFileSync(path.join(__dirname, "../.env"), `
SERVER_PORT=6935
JWT_SECRET=${generator.generate({ numbers: true, symbols: true, length: 64 })}
HOST_SITE=http://localhost:6935`)
}

if (!fs.existsSync(path.join(__dirname, "../export"))) {
	fs.mkdirSync(path.join(__dirname, "../export"));
}

if (!fs.existsSync(path.join(__dirname, "../export/img"))) {
	fs.mkdirSync(path.join(__dirname, "../export/img"));
}

if (!fs.existsSync(path.join(__dirname, "../export/audio"))) {
	fs.mkdirSync(path.join(__dirname, "../export/audio"));
}

if (!fs.existsSync(path.join(__dirname, "../export/srt"))) {
	fs.mkdirSync(path.join(__dirname, "../export/srt"));
}