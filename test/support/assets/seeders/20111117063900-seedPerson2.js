"use strict";

module.exports = {
  up: function (migration, DataTypes) {
    return migration.bulkInsert("Person", [
      {
        name: "Jane Doe",
        isBetaMember: false,
      },
    ]);
  },
  down: function (migration, DataTypes) {
    return migration.bulkDelete("Person", null, {});
  },
};
