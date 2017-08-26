'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.renameColumn('User', 'signature', 'sig'), done);
  },

  down: function (migration, DataTypes, done) {
    nodeify(migration.renameColumn('User', 'sig', 'signature'), done);
  }
};
