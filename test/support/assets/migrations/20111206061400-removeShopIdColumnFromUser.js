'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.removeColumn('User', 'shopId'), done);
  },

  down: function (migration, DataTypes, done) {
    nodeify(migration.addColumn('User', 'shopId', {
      type: DataTypes.INTEGER,
      allowNull: true
    }), done);
  }
};
