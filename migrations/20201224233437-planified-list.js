'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Planifieds", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			date: Sequelize.DataTypes.DATE,
			EpisodeId: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				references: {

					model: {
						tableName: "Episodes",
					},
					key: "id",
					onDelete: 'cascade'

				}
			},
		})

		await queryInterface.createTable("DiscordWebhooks", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			url: Sequelize.DataTypes.STRING,
			name: Sequelize.DataTypes.STRING,
			createdAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DataTypes.DATE
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Planifieds")
		await queryInterface.dropTable("DiscordWebhooks")
	}
};
