"use strict";

var fs   = require("fs");
var args = require("yargs").argv;
var path = require("path");

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
    file = file || "index";

    var sequelizePath = path.resolve(
      process.cwd(), "node_modules", "sequelize", file
    );

    try {
      return require(sequelizePath);
    } catch (e) {
      console.error("Unable to find sequelize package in " + sequelizePath);
      process.exit(1);
    }
  }
};
