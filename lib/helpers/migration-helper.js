var helpers = require(__dirname)
  , args    = require('yargs').argv
  , path    = require('path')
  , fs      = require('fs')

module.exports = {
  getMigrationsPath: function() {
    return args.migrationsPath || path.resolve(process.cwd(), 'migrations')
  },

  createMigrationsFolder: function(force) {
    var migrationsPath = this.getMigrationsPath()

    if (force) {
      console.log('Deleting the migrations folder. (--force)')

      try {
        fs.readdirSync(migrationsPath).forEach(function(filename) {
          fs.unlinkSync(migrationsPath + '/' + filename)
        })
      } catch(e) {
        console.log(e)
      }
      try {
        fs.rmdirSync(migrationsPath)
        console.log('Successfully deleted the migrations folder.')
      } catch(e) {
        console.log(e)
      }
    }

    try {
      helpers.generic.mkdirp(migrationsPath)
      console.log('Successfully created migrations folder at "' + migrationsPath + '".')
    } catch(e) {
      console.log(e)
    }
  }
}
