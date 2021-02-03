module.exports = (sequelize, DataTypes) => {
  const Podcast = sequelize.define(
    "Podcast",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      slogan: DataTypes.STRING,
      author: DataTypes.STRING,
      email: DataTypes.STRING,
      itunes_category: DataTypes.STRING,
      itunes_subcategory: DataTypes.STRING,
      logo: DataTypes.STRING,
      prefix: DataTypes.STRING,
      explicit: DataTypes.BOOLEAN,
      type: DataTypes.STRING,
      data: DataTypes.JSON,
    },
    {}
  );
  Podcast.associate = function (models) {
    models.Podcast.hasMany(models.PersonPodcast);
  };
  return Podcast;
};
