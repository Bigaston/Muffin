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
		await queryInterface.dropTable("Pushes")

	}
};
