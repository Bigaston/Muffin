module.exports = (sequelize, DataTypes) => {
  const PersonPodcast = sequelize.define(
    "PersonPodcast",
    {
      group: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  PersonPodcast.associate = function (models) {
    models.PersonPodcast.belongsTo(models.Person);
    models.PersonPodcast.belongsTo(models.Podcast);
  };
  return PersonPodcast;
};
