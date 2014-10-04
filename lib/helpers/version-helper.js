"use strict";

var path        = require("path");
var packageJson = require(path.resolve(__dirname, "..", "..", "package.json"));
var helpers     = require(__dirname);
var findup      = require("findup-sync");

module.exports = {
  getCliVersion: function() {
    return packageJson.version;
  },

  getOrmVersion: function() {
    return helpers.generic.getSequelize("package.json").version;
  },

  getDialect: function () {
    try {
      return helpers.config.readConfig({ logging: false });
    } catch (e) {
      return null;
    }
  },

  getDialectVersion: function() {
    var adapterName = this.getDialectName();

    try {
      if (adapterName) {
        return require(
          findup("package.json")
        ).dependencies[adapterName];
      }
    } catch (e) {
    }

    return null;
  },

  getDialectName: function() {
    var config = this.getDialect();

    if (config) {
      return {
        "sqlite":   "sqlite3",
        "postgres": "pg",
        "mariadb":  "mariasql",
        "mysql":    "mysql"
      }[config.dialect];
    } else {
      return null;
    }
  },

  getNodeVersion: function () {
    return process.version.replace("v", "");
  }
};
