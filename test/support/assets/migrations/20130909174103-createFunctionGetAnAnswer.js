'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.createFunction('get_an_answer', [], 'int', 'plpgsql', 'RETURN 42;'), done);
  },
  down(migration, DataTypes, done) {
    nodeify(migration.dropFunction('get_an_answer', []), done);
  }
};
