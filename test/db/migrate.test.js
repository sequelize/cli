var expect    = require('expect.js')
  , Support   = require(__dirname + '/../support')
  , helpers   = require(__dirname + '/../support/helpers')
  , gulp      = require('gulp')
  ;

([
  'db:migrate',
  'db:migrate --coffee',
  'db:migrate --config ../../support/tmp/config/config.json',
  'db:migrate --config ' + Support.resolveSupportPath('tmp', 'config', 'config.json')
]).forEach(function(flag) {
  var prepare = function(callback) {
    var migrationFile = "createPerson." + ((flag.indexOf('coffee') === -1) ? 'js' : 'coffee')

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration(migrationFile))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), 'config/config.json'))
      .pipe(helpers.runCli(flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback))
  }

  describe(Support.getTestDialectTeaser(flag), function() {
    it("creates a SequelizeMeta table", function(done) {
      var self = this

      prepare(function(err, stdout) {
        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(2)
          expect(tables).to.contain("SequelizeMeta")
          done()
        })
      })
    })

    it("creates the respective table", function(done) {
      var self = this

      prepare(function() {
        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(2)
          expect(tables).to.contain("Person")
          done()
        })
      })
    })
  })
})
