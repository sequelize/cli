'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.renameColumn('User', 'signature', 'sig'), done);
  },

  down(migration, DataTypes, done) {
    nodeify(migration.renameColumn('User', 'sig', 'signature'), done);
  }
};
