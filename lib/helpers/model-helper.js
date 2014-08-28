"use strict";

var helpers = require(__dirname);
var _       = require("lodash");
var clc     = require("cli-color");
var fs      = require("fs-extra");

module.exports = {
  notifyAboutExistingFile: function(file) {
    helpers.view.error(
      "The file " + clc.blueBright(file) + " already exists. " +
      "Run 'sequelize model:create --force' to overwrite it."
    );
  },

  transformAttributes: function(flag) {
    /*
      possible flag formats:
      - first_name:string,last_name:string,bio:text
      - "first_name:string last_name:string bio:text"
      - "first_name:string, last_name:string, bio:text"
    */

    var set    = flag.replace(/,/g, " ").split(/\s+/);
    var result = {};

    set.forEach(function(pair) {
      var split = pair.split(":");
      result[split[0]] = split[1];
    });

    return result;
  },

  generateFileContent: function(args) {
    var attributes      = this.transformAttributes(args.attributes);
    var attributesArray = [];
    var modelContent    = helpers.asset.read("models/model.js");

    _.each(attributes, function(value, key) {
      attributesArray.push(key + ": DataTypes." + value.toUpperCase());
    });

    modelContent = modelContent.replace(/(__NAME__)/g, args.name);
    modelContent = modelContent.replace("__ATTRIBUTES__", "    " + attributesArray.join(",\n    "));

    return modelContent;
  },

  generateFile: function(args) {
    var modelPath = helpers.path.getModelPath(args.name);
    helpers.asset.write(modelPath, this.generateFileContent(args));
  },

  modelFileExists: function(filePath) {
    return fs.existsSync(filePath);
  }
};
