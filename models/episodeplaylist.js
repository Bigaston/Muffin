'use strict';

module.exports = (sequelize, DataTypes) => {
	const EpisodePlaylist = sequelize.define('EpisodePlaylist', {
		place: DataTypes.INTEGER
	}, {

	});
	EpisodePlaylist.associate = function (models) {
	};
	return EpisodePlaylist;
};