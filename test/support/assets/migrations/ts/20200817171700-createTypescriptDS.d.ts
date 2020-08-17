//@ts-ignore

'use strict';

module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('TypescriptDS', {
      title: DataTypes.STRING,
      body: DataTypes.TEXT,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('TypescriptDS');
  },
};
