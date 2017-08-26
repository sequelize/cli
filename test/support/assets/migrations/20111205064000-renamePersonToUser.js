'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.renameTable('Person', 'User'), done);
  },

  down: function (migration, DataTypes, done) {
    nodeify(migration.renameTable('User', 'Person'), done);
  }
};
