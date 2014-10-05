"use strict";

var helpers   = require(__dirname);
var _         = require("lodash");
var _s        = require("underscore.string");
var Sequelize = helpers.generic.getSequelize();
var beautify  = require("js-beautify");
var js2coffee = require("js2coffee");

module.exports = {
  getTableName: function(modelName) {
    return Sequelize.Utils.pluralize(modelName);
  },

  generateTableCreationFileContent: function(args) {
    var template = helpers.asset.read("migrations/create-table.js");
    var content  = beautify(_.template(template, {
      tableName:  this.getTableName(args.name),
      attributes: helpers.model.transformAttributes(args.attributes)
    }), {
      indent_size: 2,
      preserve_newlines: false
    });

    if (helpers.config.supportsCoffee()) {
      content = js2coffee.build(content);
    }

    return content;
  },

  generateMigrationName: function(args) {
    return _s.ltrim(_s.dasherize("create-" + args.name), "-");
  },

  generateTableCreationFile: function(args) {
    var migrationName = this.generateMigrationName(args);
    var migrationPath = helpers.path.getMigrationPath(migrationName);

    helpers.asset.write(migrationPath, this.generateTableCreationFileContent(args));
  }
};
