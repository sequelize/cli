'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.bulkInsert('Person', [{
      name: 'John Doe',
      isBetaMember: false
    }], {
      name: {},
      isBetaMember: {}
    }), done);
  },
  down: function (migration, DataTypes, done) {
    nodeify(migration.bulkDelete('Person', null, {}), done);
  }
};
