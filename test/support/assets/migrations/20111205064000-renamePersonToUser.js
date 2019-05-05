'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.renameTable('Person', 'User'), done);
  },

  down(migration, DataTypes, done) {
    nodeify(migration.renameTable('User', 'Person'), done);
  }
};
