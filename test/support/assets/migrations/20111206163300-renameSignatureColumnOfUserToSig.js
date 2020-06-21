"use strict";

module.exports = {
  up: function (migration, DataTypes) {
    return migration.renameColumn("User", "signature", "sig");
  },

  down: function (migration, DataTypes) {
    return migration.renameColumn("User", "sig", "signature");
  },
};
