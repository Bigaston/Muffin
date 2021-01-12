'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Icecasts", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			url: Sequelize.DataTypes.STRING,
			mountpoint: Sequelize.DataTypes.STRING,
			title: Sequelize.DataTypes.STRING,
			description: Sequelize.DataTypes.TEXT,
			desc_parsed: Sequelize.DataTypes.TEXT,
			small_desc: Sequelize.DataTypes.STRING,
			record_episode: Sequelize.DataTypes.BOOLEAN,
			img: Sequelize.DataTypes.STRING
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Icecasts")

	}
};
