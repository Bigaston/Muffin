'use strict';

module.exports = (sequelize, DataTypes) => {
	const Playlist = sequelize.define('Playlist', {
		title: DataTypes.STRING,
		description: DataTypes.TEXT,
		slug: DataTypes.STRING,
		img: DataTypes.STRING,
	}, {

	});
	Playlist.associate = function (models) {
		models.Playlist.belongsToMany(models.Episode, { through: models.EpisodePlaylist })
	};
	return Playlist;
};