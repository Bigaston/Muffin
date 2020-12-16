'use strict';

module.exports = (sequelize, DataTypes) => {
	const UserReaction = sequelize.define('UserReaction', {
		fingerprint: DataTypes.STRING,
		useragent: DataTypes.STRING,
		ip: DataTypes.STRING
	}, {

	});
	UserReaction.associate = function (models) {
		UserReaction.belongsTo(models.Episode);
		UserReaction.belongsTo(models.Reaction);
	};
	return UserReaction;
};