const fs = require("fs")
const path = require("path")
const generator = require('generate-password');

if (!fs.existsSync(path.join(__dirname, "../.env"))) {
	fs.writeFileSync(path.join(__dirname, "../.env"), `
SERVER_PORT=6935
JWT_SECRET=${generator.generate({ numbers: true, symbols: true, length: 64 })}
HOST_SITE=http://localhost:6935`)
}