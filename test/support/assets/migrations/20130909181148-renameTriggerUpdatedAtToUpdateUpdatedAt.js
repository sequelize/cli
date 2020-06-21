'use strict';

module.exports = {
  up: function (migration) {
    return migration.renameTrigger(
      'trigger_test',
      'updated_at',
      'update_updated_at'
    );
  },
  down: function (migration) {
    return migration.renameTrigger(
      'trigger_test',
      'update_updated_at',
      'updated_at'
    );
  },
};
