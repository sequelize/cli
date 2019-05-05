'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.dropFunction('get_the_answer', []), done);
  },
  down(migration, DataTypes, done) {
    nodeify(migration.createFunction('get_the_answer', 'int', 'plpgsql', 'RETURN 42;'), done);
  }
};
