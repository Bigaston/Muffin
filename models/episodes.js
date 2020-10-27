'use strict';

const { DATE } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Episode = sequelize.define('Episode', {
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        desc_parsed: DataTypes.TEXT,
        pub_date: DataTypes.DATE,
        author: DataTypes.STRING,
        link: DataTypes.STRING,
        guid: DataTypes.STRING,
        enclosure: DataTypes.STRING,
        size: DataTypes.INTEGER,
        duration: DataTypes.STRING,
        type: DataTypes.STRING,
        img: DataTypes.STRING,
        episode: DataTypes.INTEGER,
        saison: DataTypes.INTEGER,

    }, {

    });
    Episode.associate = function(models) {
    
    };
    return Episode;
};