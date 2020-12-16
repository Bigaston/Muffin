'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		console.log("Création de la table Reaction")
		await queryInterface.createTable("Reactions", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			emoji: Sequelize.DataTypes.STRING,
			name: Sequelize.DataTypes.STRING,
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			}
		})

		console.log("Création de la table UserReaction")
		await queryInterface.createTable("UserReactions", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			fingerprint: Sequelize.DataTypes.STRING,
			useragent: Sequelize.DataTypes.STRING,
			ip: Sequelize.DataTypes.STRING,
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
				references: {
					model: {
						tableName: "Episodes",
						schema: "episodes"
					},
					key: "id",
					onDelete: 'cascade'
				}
			},
			ReactionId: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: {
						tableName: "Reactions",
						schema: "reactions"
					},
					key: "id"
				}
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Reactions")
		await queryInterface.dropTable("UserReactions")

	}
};
