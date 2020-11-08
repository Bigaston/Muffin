'use strict';

module.exports = (sequelize, DataTypes) => {
    const Podcast = sequelize.define('Podcast', {
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
		slogan: DataTypes.STRING,
		author: DataTypes.STRING,
		email: DataTypes.STRING,
		itunes_category: DataTypes.STRING,
		itunes_subcategory: DataTypes.STRING,
		prefix: DataTypes.STRING
    }, {

    });
    Podcast.associate = function(models) {
    
    };
    return Podcast;
};