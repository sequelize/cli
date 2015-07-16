'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.renameTrigger('trigger_test', 'updated_at', 'update_updated_at'), done);
  },
  down: function (migration, DataTypes, done) {
    nodeify(migration.renameTrigger('trigger_test', 'update_updated_at', 'updated_at'), done);
  }
};
