'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Podcasts', 'slug', {
			type: Sequelize.DataTypes.TEXT,
		})

		await queryInterface.addColumn('Podcasts', 'domain', {
			type: Sequelize.DataTypes.STRING,
		})

		await queryInterface.addColumn('Episodes', 'PodcastId', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: {
					tableName: "Podcasts",
				},
				key: "id"
			}
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropColumn("Podcasts", "slug");
		await queryInterface.dropColumn("Podcasts", "domain")
		await queryInterface.dropColumn("Episodes", "PodcastId")
	}
};
