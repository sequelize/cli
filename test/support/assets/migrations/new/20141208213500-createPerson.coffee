'use strict';

Bluebird  = require('bluebird')
Sequelize = require('sequelize')

module.exports =
  up: (db) ->
    Bluebird
      .delay(1000)
      .then(() -> db.createTable 'Person', name: Sequelize.STRING)
      .then(() -> db.createTable 'Task',   title: Sequelize.STRING)
