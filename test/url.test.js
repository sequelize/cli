var expect    = require('expect.js')
  , Support   = require(__dirname + '/support')
  , helpers   = require(__dirname + '/support/helpers')
  , gulp      = require('gulp')
  ;

([
  '--url'
]).forEach(function(flag) {
  var prepare = function(callback) {
    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), 'config/config.json'))
      .pipe(helpers.runCli('db:migrate ' + flag + "=" + helpers.getTestUrl()))
      .pipe(helpers.teardown(callback))
  }

  describe(Support.getTestDialectTeaser(flag), function() {
    it("creates a SequelizeMeta table", function(done) {
      var self = this

      prepare(function() {
        self.sequelize.getQueryInterface().showAllTables().success(function(tables) {
          tables = tables.sort()

          expect(tables).to.have.length(2)
          expect(tables[1]).to.equal("SequelizeMeta")
          done()
        })
      })
    })

    it("creates the respective table via url", function(done) {
      var self = this

      prepare(function() {
        self.sequelize.getQueryInterface().showAllTables().success(function(tables) {
          tables = tables.sort()

          expect(tables).to.have.length(2)
          expect(tables[0]).to.equal("Person")
          done()
        })
      })
    })
  })
})
