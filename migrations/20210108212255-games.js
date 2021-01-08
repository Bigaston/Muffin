'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Episodes', 'games', {
			type: Sequelize.DataTypes.JSON,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropColumn("Episodes", "games");
	}
};
