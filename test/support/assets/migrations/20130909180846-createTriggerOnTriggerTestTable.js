'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(
      migration.createTrigger(
        'trigger_test',
        'updated_at',
        'before',
        { update: true },
        'bump_updated_at',
        []
      ),
      done
    );
  },
  down: function (migration, DataTypes, done) {
    nodeify(migration.dropTrigger('trigger_test', 'updated_at'), done);
  }
};
