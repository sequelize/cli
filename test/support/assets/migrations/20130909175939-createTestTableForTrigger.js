'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(
      migration.createTable('trigger_test', {
        name: DataTypes.STRING,
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false
        }
      }),
      done
    );
  },

  down: function (migration, DataTypes, done) {
    nodeify(migration.dropTable('trigger_test'), done);
  }
};
