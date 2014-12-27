"use strict";

var helpers = require(__dirname);
var args    = require("yargs").argv;
var path    = require("path");
var moment  = require("moment");
var resolve = require("resolve").sync;

module.exports = {
  getMigrationsPath: function() {
    var result = args.migrationsPath || path.resolve(process.cwd(), "migrations");

    if (path.normalize(result) !== path.resolve(result)) {
      // the path is relative
      result = path.resolve(process.cwd(), result);
    }

    return result;
  },

  getMigrationFileName: function(migrationName, options) {
    return this.addFileExtension(
      [
        moment().format("YYYYMMDDHHmmss"),
        !!migrationName ? migrationName : "unnamed-migration"
      ].join("-"),
      options
    );
  },

  getFileExtension: function (options) {
    return helpers.config.supportsCoffee(options) ? "coffee" : "js";
  },

  addFileExtension: function (basename, options) {
    return [basename, this.getFileExtension(options)].join(".");
  },

  getMigrationPath: function(migrationName) {
    return path.resolve(this.getMigrationsPath(), this.getMigrationFileName(migrationName));
  },

  getModelsPath: function() {
    return args.modelsPath || path.resolve(process.cwd(), "models");
  },

  getModelPath: function(modelName) {
    return path.resolve(
      this.getModelsPath(),
      this.addFileExtension(modelName.toLowerCase())
    );
  },

  resolve: function (packageName) {
    var result;

    try {
      result = resolve(packageName, { basedir: process.cwd() });
      result = require(result);
    } catch (e) {
      try {
        result = require(packageName);
      } catch (e) {}
    }

    return result;
  }
};
