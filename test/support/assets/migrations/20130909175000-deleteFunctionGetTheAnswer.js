'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.dropFunction('get_the_answer', []), done);
  },
  down: function (migration, DataTypes, done) {
    nodeify(migration.createFunction('get_the_answer', 'int', 'plpgsql', 'RETURN 42;'), done);
  }
};
