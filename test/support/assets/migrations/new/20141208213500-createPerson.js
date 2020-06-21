'use strict';

var Bluebird = require('bluebird');
var Sequelize = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await Bluebird.delay(1);
    await queryInterface.createTable('Person', { name: Sequelize.STRING });
    await queryInterface.createTable('Task', { title: Sequelize.STRING });
  },
};
