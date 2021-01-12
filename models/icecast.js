'use strict';

module.exports = (sequelize, DataTypes) => {
	const Icecast = sequelize.define('Icecast', {
		url: DataTypes.STRING,
		mountpoint: DataTypes.STRING,
		title: DataTypes.STRING,
		description: DataTypes.TEXT,
		desc_parsed: DataTypes.TEXT,
		record_episode: DataTypes.BOOLEAN
	}, {
		timestamps: false
	});
	Icecast.associate = function (models) {
	};
	return Icecast;
};