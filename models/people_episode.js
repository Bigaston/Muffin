module.exports = (sequelize, DataTypes) => {
  const PersonEpisode = sequelize.define(
    'PersonEpisode',
    {
      group: DataTypes.STRING,
      role: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  PersonEpisode.associate = function (models) {
    models.PersonEpisode.belongsTo(models.Person, { onDelete: 'cascade' });
    models.PersonEpisode.belongsTo(models.Episode, { onDelete: 'cascade' });
  };
  return PersonEpisode;
};
