"use strict";

var Bluebird  = require("bluebird");
var Sequelize = require("sequelize");

module.exports = {
  up: function(db) {
    return Bluebird
      .delay(1000)
      .then(function () {
        return db.createTable("Person", { name: Sequelize.STRING });
      })
      .then(function () {
        return db.createTable("Task", { title: Sequelize.STRING });
      });
  }
};
