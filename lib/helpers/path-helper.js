var helpers = require(__dirname)
  , args    = require('yargs').argv
  , path    = require('path')
  , fs      = require('fs')

module.exports = {
  getMigrationsPath: function() {
    return args.migrationsPath || path.resolve(process.cwd(), 'migrations')
  },

  getModelsPath: function() {
    return args.modelsPath || path.resolve(process.cwd(), 'models')
  }
}
