module.exports = (sequelize, DataTypes) => {
  const People = sequelize.define(
    "People",
    {
      name: DataTypes.STRING,
      url: DataTypes.STRING,
      img: DataTypes.STRING,
    },
    {}
  );
  People.associate = function (models) {};
  return People;
};
