"use strict";

module.exports = {
  up: function (migration, DataTypes) {
    return igration.renameFunction("get_an_answer", [], "get_the_answer");
  },
  down: function (migration, DataTypes) {
    return migration.renameFunction("get_the_answer", [], "get_an_answer");
  },
};
