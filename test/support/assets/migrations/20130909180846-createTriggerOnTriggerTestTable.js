'use strict';

module.exports = {
  up: function (migration) {
    return migration.createTrigger(
      'trigger_test',
      'updated_at',
      'before',
      { update: true },
      'bump_updated_at',
      []
    );
  },
  down: function (migration) {
    return migration.dropTrigger('trigger_test', 'updated_at');
  },
};
