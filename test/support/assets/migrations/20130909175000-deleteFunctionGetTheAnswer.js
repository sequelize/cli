'use strict';

module.exports = {
  up: function (migration) {
    return migration.dropFunction('get_the_answer', []);
  },
  down: function (migration) {
    return migration.createFunction(
      'get_the_answer',
      'int',
      'plpgsql',
      'RETURN 42;'
    );
  },
};
