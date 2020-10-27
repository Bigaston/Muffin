require("dotenv").config()
const db = require("../models/index.js")

db.sequelize.sync().then(()=> {
	console.log("Création des tables réussies!")
}).catch(error => {
    console.log("Erreur lors de la création des tables!")
})