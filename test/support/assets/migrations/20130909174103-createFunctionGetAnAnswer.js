"use strict";

module.exports = {
  up: function (migration, DataTypes) {
    return migration.createFunction(
      "get_an_answer",
      [],
      "int",
      "plpgsql",
      "RETURN 42;"
    );
  },
  down: function (migration, DataTypes) {
    return migration.dropFunction("get_an_answer", []);
  },
};
