module.exports = (sequelize, DataTypes) => {
  const Person = sequelize.define(
    'Person',
    {
      name: DataTypes.STRING,
      url: DataTypes.STRING,
      img: DataTypes.STRING,
    },
    {
      tableName: 'Persons',
    }
  );
  Person.associate = function (models) {
    models.Person.hasMany(models.PersonEpisode);
    models.Person.hasMany(models.PersonPodcast);
  };
  return Person;
};
