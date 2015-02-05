"use strict";

var _         = require("lodash");
var helpers   = require(__dirname);
var Sequelize = helpers.generic.getSequelize();

module.exports = {
  getTableName: function(modelName) {
    return Sequelize.Utils.pluralize(modelName);
  },

  generateTableCreationFileContent: function(args) {
    return helpers.template.render("migrations/create-table.js", {
      tableName:  this.getTableName(args.name),
      attributes: helpers.model.transformAttributes(args.attributes)
    });
  },

  generateMigrationName: function(args) {
    return _.trimLeft(_.kebabCase("create-" + args.name), "-");
  },

  generateTableCreationFile: function(args) {
    var migrationName = this.generateMigrationName(args);
    var migrationPath = helpers.path.getMigrationPath(migrationName);

    helpers.asset.write(migrationPath, this.generateTableCreationFileContent(args));
  }
};
