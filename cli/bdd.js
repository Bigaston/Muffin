require("dotenv").config()
const db = require("../models/index.js")
const fs = require("fs")
const path = require("path");

db.sequelize.sync().then(()=> {
	console.log("Création des tables réussies!")

	db.Podcast.findOne().then((podcast) => {
		if (podcast === null) {
			db.Podcast.create({
				title: "Muffin Cast",
				description: "Le super premier podcast de Muffin! N'hésitez pas à modifier ces informations!",
				slogan: "Le slogan de votre podcast",
				author: "Muffi, the Muffin",
				email: "muffin@muffin.pm",
				itunes_category: "Technology",
				itunes_subcategory: "",
				prefix: "",
				logo: "/img/pod.jpg",
				explicit: false,
				type: "episodic"
			}).then(() => {
				fs.copyFileSync(path.join(__dirname, "./base_img.jpg"), path.join(__dirname, "../export/img/pod.jpg"));
			})
		} 
	})
	
	db.User.findOne().then((user) => {
		if (user === null) {
			db.User.create({
				username: "muffin",
				password: "$2b$12$iylmz6Tx.xJY9pL22o1yNu3s3.GO.3Hw6kdDB79hxxJpkJJgME2s2" 
			}).then(() => {
	
			})
		} 
	})
}).catch(error => {
    console.log("Erreur lors de la création des tables!")
})