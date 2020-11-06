const fs = require("fs")
const path = require("path")

console.log("Création des fichiers de base")

if (!fs.existsSync(path.join(__dirname, "../.env"))) {
    fs.writeFileSync(path.join(__dirname, "../.env"), `
PORT=6935`)
}

if (!fs.existsSync(path.join(__dirname, "../upload"))) {
	fs.mkdirSync(path.join(__dirname, "../upload"));
	fs.mkdirSync(path.join(__dirname, "../upload/img"));
	fs.mkdirSync(path.join(__dirname, "../upload/audio"));
}