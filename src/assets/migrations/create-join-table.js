'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('<%= tableName %>', {
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },

        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },

        <%= source %>Id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },

        <%= target %>Id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
        },
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('<%= tableName %>');
  }
};