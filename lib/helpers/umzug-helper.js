"use strict";

var path    = require("path");
var _       = require("lodash");
var helpers = require(__dirname);

module.exports = {
  getStorageOption: function (property, fallback) {
    return helpers.config.readConfig()[property] || fallback;
  },

  getStorage: function () {
    return this.getStorageOption("migrationStorage", "sequelize");
  },

  getStoragePath: function () {
    var fallbackPath = path.join(process.cwd(), "sequelize-meta.json");
    return this.getStorageOption("migrationStoragePath", fallbackPath);
  },

  getTableName: function () {
    return this.getStorageOption("migrationStorageTableName", "SequelizeMeta");
  },

  getStorageOptions: function (extraOptions) {
    var options = {};

    if (this.getStorage() === "json") {
      options.path = this.getStoragePath();
    } else {
      options.tableName = this.getTableName();
    }

    _.assign(options, extraOptions);

    return options;
  }
};
