'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.renameFunction('get_an_answer', [], 'get_the_answer'), done);
  },
  down(migration, DataTypes, done) {
    nodeify(migration.renameFunction('get_the_answer', [], 'get_an_answer'), done);
  }
};
