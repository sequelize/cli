'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.dropTrigger('trigger_test', 'update_updated_at'), done);
  },

  down(migration, DataTypes, done) {
    nodeify(
      migration.createTrigger(
        'trigger_test',
        'update_updated_at',
        'before',
        { update: true },
        'bump_updated_at',
        []
      ),
      done
    );
  }
};
