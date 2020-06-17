'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration
      .createTable('Comment', {
        title: DataTypes.STRING,
        body: DataTypes.TEXT
      }), done);
  },

  down: function (migration, DataTypes, done) {
    nodeify(migration.dropTable('Comment'), done);
  }
};
