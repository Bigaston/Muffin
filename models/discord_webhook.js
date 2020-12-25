'use strict';

module.exports = (sequelize, DataTypes) => {
	const DiscordWebhook = sequelize.define('DiscordWebhook', {
		url: DataTypes.STRING,
		name: DataTypes.STRING
	}, {

	});
	DiscordWebhook.associate = function (models) {
	};
	return DiscordWebhook;
};