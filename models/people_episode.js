module.exports = (sequelize, DataTypes) => {
  const PersonEpisode = sequelize.define(
    "PersonEpisode",
    {
      group: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  PersonEpisode.associate = function (models) {
    models.PersonEpisode.belongsTo(models.Person);
    models.PersonEpisode.belongsTo(models.Episode);
  };
  return PersonEpisode;
};
