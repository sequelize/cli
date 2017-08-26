'use strict';

Bluebird  = require('bluebird')
Sequelize = require('sequelize')

module.exports =
  up: (db) ->
    Bluebird
      .delay(1000)
      .then(() -> db.sequelize.query 'INVALID QUERY'
