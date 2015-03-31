'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration
      .bulkInsert('Person', [{
        name: 'Jane Doe',
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
