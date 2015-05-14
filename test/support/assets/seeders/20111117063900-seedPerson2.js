'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    migration
      .bulkInsert('Person', [{
        name: 'Jane Doe',
        isBetaMember: false
      }], {
        name: {},
        isBetaMember: {}
      })
      .complete(done);
  },
  down: function (migration, DataTypes, done) {
    migration.bulkDelete('Person', null, {}).done(done).catch(done);
  }
};
