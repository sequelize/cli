'use strict';

module.exports = {
  up: function (migration) {
    return migration.renameTable('Person', 'User');
  },

  down: function (migration) {
    return migration.renameTable('User', 'Person');
  },
};
