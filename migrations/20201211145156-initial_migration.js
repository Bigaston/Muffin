'use strict';

const fs = require("fs");
const path = require("path")

module.exports = {
	up: async (queryInterface, Sequelize) => {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */

		console.log("Création de Episode")
		await queryInterface.createTable("Episodes", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			title: Sequelize.DataTypes.STRING,
			description: Sequelize.DataTypes.TEXT,
			desc_parsed: Sequelize.DataTypes.TEXT,
			small_desc: Sequelize.DataTypes.STRING,
			pub_date: Sequelize.DataTypes.DATE,
			author: Sequelize.DataTypes.STRING,
			slug: Sequelize.DataTypes.STRING,
			guid: Sequelize.DataTypes.STRING,
			enclosure: Sequelize.DataTypes.STRING,
			size: Sequelize.DataTypes.INTEGER,
			duration: Sequelize.DataTypes.STRING,
			type: Sequelize.DataTypes.STRING,
			img: Sequelize.DataTypes.STRING,
			episode: Sequelize.DataTypes.INTEGER,
			saison: Sequelize.DataTypes.INTEGER,
			explicit: Sequelize.DataTypes.BOOLEAN,
			data: Sequelize.DataTypes.JSON,
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			}
		})

		console.log("Création de Playlist")
		await queryInterface.createTable("Playlists", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			title: Sequelize.STRING,
			description: Sequelize.TEXT,
			slug: Sequelize.STRING,
			img: Sequelize.STRING,
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			}
		})

		console.log("Création de Podcast")
		await queryInterface.createTable("Podcasts", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			title: Sequelize.DataTypes.STRING,
			description: Sequelize.DataTypes.TEXT,
			slogan: Sequelize.DataTypes.STRING,
			author: Sequelize.DataTypes.STRING,
			email: Sequelize.DataTypes.STRING,
			itunes_category: Sequelize.DataTypes.STRING,
			itunes_subcategory: Sequelize.DataTypes.STRING,
			logo: Sequelize.DataTypes.STRING,
			prefix: Sequelize.DataTypes.STRING,
			explicit: Sequelize.DataTypes.BOOLEAN,
			type: Sequelize.DataTypes.STRING,
			data: Sequelize.DataTypes.JSON,
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			}
		})

		console.log("Création de User")
		await queryInterface.createTable("Users", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			username: Sequelize.DataTypes.STRING,
			password: Sequelize.DataTypes.STRING,
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			}
		})

		console.log("Création de EpisodePlaylist")
		await queryInterface.createTable("EpisodePlaylists", {
			place: Sequelize.DataTypes.INTEGER,
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			EpisodeId: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: {
						tableName: "Episodes",
					},
					key: "id"
				}
			},
			PlaylistId: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				references: {
					model: {
						tableName: "Playlists",
					},
					key: "id"
				}
			}
		})

		console.log("Insertion de l'utilisateur par défaut")
		try {
			await queryInterface.bulkInsert("Users", [{
				id: 1,
				username: "muffin",
				password: "$2b$12$iylmz6Tx.xJY9pL22o1yNu3s3.GO.3Hw6kdDB79hxxJpkJJgME2s2",
				createdAt: new Date(),
				updatedAt: new Date()
			}])
		} catch (err) {
		}

		console.log("Insertion du podcast par défaut")
		try {
			await queryInterface.bulkInsert("Podcasts", [{
				id: 1,
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
				type: "episodic",
				data: JSON.stringify({ twitter: "", youtube: "", instagram: "", donation: "", apple_podcast: "", spotify: "", google_podcast: "", deezer: "", podcast_addict: "", podcloud: "" }),
				createdAt: new Date(),
				updatedAt: new Date()
			}])

			console.log("Copie de l'image")
			fs.copyFileSync(path.join(__dirname, "../cli/base_img.jpg"), path.join(__dirname, "../export/img/pod.jpg"));
		} catch (err) {
		}
	},

	down: async (queryInterface, Sequelize) => {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	}
};
