"use strict";

var fs   = require("fs");
var args = require("yargs").argv;
var path = require("path");
var resolve = require("resolve").sync;

module.exports = {
  mkdirp: function (path, root) {
    var dirs = path.split("/");
    var dir  = dirs.shift();

    root = (root || "") + dir + "/";

    try {
      fs.mkdirSync(root);
    } catch (e) {
      // dir wasn't made, something went wrong
      if (!fs.statSync(root).isDirectory()) {
        throw new Error(e);
      }
    }

    return !dirs.length || this.mkdirp(dirs.join("/"), root);
  },

  getEnvironment: function() {
    return args.env || process.env.NODE_ENV || "development";
  },

  getSequelize: function (file) {
    var sequelizePath;

    try {
      sequelizePath = resolve(
        file ? path.join("sequelize", file) : "sequelize",
        { basedir: process.cwd() }
      );
    } catch (e) {
      console.error("Unable to resolve sequelize package in " + process.cwd());
      process.exit(1);
    }

    return require(sequelizePath);
  }
};
