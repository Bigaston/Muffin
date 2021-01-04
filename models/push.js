'use strict';

module.exports = (sequelize, DataTypes) => {
	const Push = sequelize.define('Push', {
		data: DataTypes.JSON
	}, {

	});
	Push.associate = function (models) {

	};
	return Push;
};