'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(
      migration.addColumn('User', 'uniqueName', { type: DataTypes.STRING }),
      function () {
        nodeify(
          migration.changeColumn('User', 'uniqueName', {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
          }),
          done
        );
      }
    );
  },

  down: function (migration, DataTypes, done) {
    nodeify(migration.removeColumn('User', 'uniqueName'), done);
  }
};
