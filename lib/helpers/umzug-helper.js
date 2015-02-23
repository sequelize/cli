"use strict";

var path    = require("path");
var _       = require("lodash");
var helpers = require(__dirname);

module.exports = {
  getStorage: function () {
    return helpers.config.readConfig().migrationStorage || "sequelize";
  },

  getStoragePath: function () {
    return helpers.config.readConfig().migrationStoragePath ||
      path.join(process.cwd(), "sequelize-meta.json");
  },

  getStorageOptions: function (extraOptions) {
    var options = {};

    if (this.getStorage() === "json") {
      options.path = this.getStoragePath();
    }

    _.assign(options, extraOptions);

    return options;
  }
};
