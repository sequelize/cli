'use strict';

module.exports = {
  up: function (migration) {
    return migration.renameFunction('get_an_answer', [], 'get_the_answer');
  },
  down: function (migration) {
    return migration.renameFunction('get_the_answer', [], 'get_an_answer');
  },
};
