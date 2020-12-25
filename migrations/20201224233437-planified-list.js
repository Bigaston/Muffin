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
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("Planifieds")
	}
};
