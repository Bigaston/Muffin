'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("Pushes", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.INTEGER
			},
			data: Sequelize.DataTypes.JSON,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Pushes")

	}
};
