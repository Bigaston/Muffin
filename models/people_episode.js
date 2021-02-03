module.exports = (sequelize, DataTypes) => {
  const PeopleEpisode = sequelize.define(
    "PeopleEpisode",
    {
      group: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  PeopleEpisode.associate = function (models) {
    models.PeopleEpisode.belongsTo(models.People);
    models.PeopleEpisode.belongsTo(models.Episode);
  };
  return PeopleEpisode;
};
