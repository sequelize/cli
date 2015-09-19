'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.renameFunction('get_an_answer', [], 'get_the_answer'), done);
  },
  down: function (migration, DataTypes, done) {
    nodeify(migration.renameFunction('get_the_answer', [], 'get_an_answer'), done);
  }
};
