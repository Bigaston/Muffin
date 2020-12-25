'use strict';

module.exports = (sequelize, DataTypes) => {
	const Planified = sequelize.define('Planified', {
		date: DataTypes.DATE
	}, {
		timestamps: false
	});
	Planified.associate = function (models) {
		Planified.belongsTo(models.Episode);
	};
	return Planified;
};