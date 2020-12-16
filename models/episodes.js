'use strict';

module.exports = (sequelize, DataTypes) => {
	const Episode = sequelize.define('Episode', {
		title: DataTypes.STRING,
		description: DataTypes.TEXT,
		desc_parsed: DataTypes.TEXT,
		small_desc: DataTypes.STRING,
		pub_date: DataTypes.DATE,
		author: DataTypes.STRING,
		slug: DataTypes.STRING,
		guid: DataTypes.STRING,
		enclosure: DataTypes.STRING,
		size: DataTypes.INTEGER,
		duration: DataTypes.STRING,
		type: DataTypes.STRING,
		img: DataTypes.STRING,
		episode: DataTypes.INTEGER,
		saison: DataTypes.INTEGER,
		explicit: DataTypes.BOOLEAN,
		data: DataTypes.JSON
	}, {

	});
	Episode.associate = function (models) {
		models.Episode.belongsToMany(models.Playlist, { through: models.EpisodePlaylist })
		models.Episode.hasMany(models.UserReaction);
	};
	return Episode;
};