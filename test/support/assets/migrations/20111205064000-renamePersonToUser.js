"use strict";

module.exports = {
  up: function (migration, DataTypes) {
    return migration.renameTable("Person", "User");
  },

  down: function (migration, DataTypes) {
    return migration.renameTable("User", "Person");
  },
};
