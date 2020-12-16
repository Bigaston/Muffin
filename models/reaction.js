'use strict';

module.exports = (sequelize, DataTypes) => {
	const Reaction = sequelize.define('Reaction', {
		emoji: DataTypes.STRING,
		name: DataTypes.STRING
	}, {

	});
	Reaction.associate = function (models) {
		Reaction.hasMany(models.UserReaction);
	};
	return Reaction;
};