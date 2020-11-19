const fs = require("fs")
const path = require("path")
const generator = require('generate-password');

console.log("Création des fichiers de base")

if (!fs.existsSync(path.join(__dirname, "../.env"))) {
	fs.writeFileSync(path.join(__dirname, "../.env"), `
PORT=3000	
SERVER_PORT=6935
JWT_SECRET=${generator.generate({ numbers: true, symbols: true, length: 64 })}
HOST_SITE=http://localhost:6935`)
}

if (!fs.existsSync(path.join(__dirname, "../upload"))) {
	fs.mkdirSync(path.join(__dirname, "../upload"));
	fs.mkdirSync(path.join(__dirname, "../upload/img"));
	fs.mkdirSync(path.join(__dirname, "../upload/audio"));
}