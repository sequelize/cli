'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration
      .createTable('Person', {
        name: DataTypes.STRING,
        isBetaMember: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false
        }
      }), done);
  },

  down: function (migration, DataTypes, done) {
    nodeify(migration.dropTable('Person'), done);
  }
};
