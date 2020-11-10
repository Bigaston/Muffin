const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bdd = require("../../models")

module.exports = {
	login: (req, res) => {
		if (!!req.body.login && !!req.body.password) {
			bdd.User.findOne({where: {username: req.body.login}}).then((user) => {
				if (user != null) {
					bcrypt.compare(req.body.password, user.password, function(err, result) {
						if (result) {
							let token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "2h"})
							res.send({username: user.username, id: user.id, jwt: token});
						} else {
							res.status(401).send("Bad Password or Username")
						}
					});					
				} else {
					res.status(401).send("Bad Password or Username")
				}
			})
		} else {
			res.status(400).send("Bad Request")
		}
	},
	whoami: (req, res) => {

	}
}