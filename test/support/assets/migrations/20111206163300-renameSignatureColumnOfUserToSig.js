'use strict';

module.exports = {
  up: function (migration) {
    return migration.renameColumn('User', 'signature', 'sig');
  },

  down: function (migration) {
    return migration.renameColumn('User', 'sig', 'signature');
  },
};
