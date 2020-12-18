'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Episodes', 'transcript', {
			type: Sequelize.DataTypes.TEXT,
		})

		await queryInterface.addColumn('Episodes', 'transcript_file', {
			type: Sequelize.DataTypes.STRING,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropColumn("Episodes", "transcript");
		await queryInterface.dropColumn("Episodes", "transcript_file")
	}
};
