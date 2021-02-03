module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Persons', {
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

    await queryInterface.createTable('PersonPodcasts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      group: Sequelize.DataTypes.STRING,
      role: Sequelize.DataTypes.STRING,
      PersonId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Persons',
          },
          key: 'id',
          onDelete: 'cascade',
        },
      },
      PodcastId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Podcasts',
          },
          key: 'id',
          onDelete: 'cascade',
        },
      },
    });

    await queryInterface.createTable('PersonEpisodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      group: Sequelize.DataTypes.STRING,
      role: Sequelize.DataTypes.STRING,
      PersonId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Persons',
          },
          key: 'id',
          onDelete: 'cascade',
        },
      },
      EpisodeId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'Episodes',
          },
          key: 'id',
          onDelete: 'cascade',
        },
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Persons');
    await queryInterface.dropTable('PersonPodcasts');
    await queryInterface.dropTable('PersonEpisodes');
  },
};
