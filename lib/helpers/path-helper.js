var helpers = require(__dirname)
  , args    = require('yargs').argv
  , path    = require('path')
  , fs      = require('fs')
  , moment  = require('moment')

module.exports = {
  getMigrationsPath: function() {
    var result = args.migrationsPath || path.resolve(process.cwd(), 'migrations')

    if (path.normalize(result) !== path.resolve(result)) {
      // the path is relative
      result = path.resolve(process.cwd(), result)
    }

    return result
  },

  getMigrationFileName: function(migrationName, options) {
    var migrationExtension = helpers.config.supportsCoffee(options) ? '.coffee' : '.js'
      , fullMigrationName  = [
          moment().format('YYYYMMDDHHmmss'),
          !!migrationName ? migrationName : 'unnamed-migration'
        ].join('-') + migrationExtension

    return fullMigrationName
  },

  getMigrationPath: function(migrationName) {
    return path.resolve(this.getMigrationsPath(), this.getMigrationFileName(migrationName))
  },

  getModelsPath: function() {
    return args.modelsPath || path.resolve(process.cwd(), 'models')
  },

  getModelPath: function(modelName) {
    return path.resolve(this.getModelsPath(), modelName.toLowerCase() + '.js')
  }
}
