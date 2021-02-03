module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Peoples", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      name: Sequelize.DataTypes.STRING,
      url: Sequelize.DataTypes.STRING,
      img: Sequelize.DataTypes.STRING,
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
    });

    await queryInterface.createTable("PeoplePodcasts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      group: Sequelize.DataTypes.STRING,
      role: Sequelize.DataTypes.STRING,
      PeopleId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "Peoples",
          },
          key: "id",
        },
      },
      PodcastId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "Podcasts",
          },
          key: "id",
        },
      },
    });

    await queryInterface.createTable("PeopleEpisodes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      group: Sequelize.DataTypes.STRING,
      role: Sequelize.DataTypes.STRING,
      PeopleId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "Peoples",
          },
          key: "id",
        },
      },
      EpisodeId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "Episodes",
          },
          key: "id",
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Peoples");
    await queryInterface.dropTable("PeoplePodcasts");
    await queryInterface.dropTable("PeopleEpisodes");
  },
};
