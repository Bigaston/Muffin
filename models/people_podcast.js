module.exports = (sequelize, DataTypes) => {
  const PeoplePodcast = sequelize.define(
    "PeoplePodcast",
    {
      group: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  PeoplePodcast.associate = function (models) {
    models.PeoplePodcast.belongsTo(models.People);
    models.PeoplePodcast.belongsTo(models.Podcast);
  };
  return PeoplePodcast;
};
