'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('Comment', {
      title: DataTypes.STRING,
      body: DataTypes.TEXT,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Comment');
  },
};
