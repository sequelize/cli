'use strict';

const Bluebird  = require('bluebird');
const Sequelize = require('sequelize');

module.exports = {
  up(db) {
    return Bluebird
      .delay(1000)
      .then(() => {
        return db.createTable('Person', { name: Sequelize.STRING });
      })
      .then(() => {
        return db.createTable('Task', { title: Sequelize.STRING });
      });
  }
};
