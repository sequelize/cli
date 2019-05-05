'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.removeColumn('User', 'shopId'), done);
  },

  down(migration, DataTypes, done) {
    nodeify(migration.addColumn('User', 'shopId', {
      type: DataTypes.INTEGER,
      allowNull: true
    }), done);
  }
};
