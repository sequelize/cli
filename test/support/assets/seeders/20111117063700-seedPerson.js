'use strict';

module.exports = {
  up: function (migration) {
    return migration.bulkInsert('Person', [
      {
        name: 'John Doe',
        isBetaMember: false,
      },
    ]);
  },
  down: function (migration) {
    return migration.bulkDelete('Person', null, {});
  },
};
