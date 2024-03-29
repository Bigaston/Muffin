module.exports = (sequelize, DataTypes) => {
  const Icecast = sequelize.define(
    "Icecast",
    {
      url: DataTypes.STRING,
      mountpoint: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      desc_parsed: DataTypes.TEXT,
      small_desc: DataTypes.STRING,
      record_episode: DataTypes.BOOLEAN,
      publish_instant: DataTypes.BOOLEAN,
      img: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  Icecast.associate = function (models) {};
  return Icecast;
};
