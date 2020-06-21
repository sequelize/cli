"use strict";

module.exports = {
  up: function (migration, DataTypes) {
    return migration.dropFunction("get_the_answer", []);
  },
  down: function (migration, DataTypes) {
    return migration.createFunction(
      "get_the_answer",
      "int",
      "plpgsql",
      "RETURN 42;"
    );
  },
};
