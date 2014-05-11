var expect    = require('expect.js')
  , Support   = require(__dirname + '/support')
  , dialect   = Support.getTestDialect()
  , _         = Support.Sequelize.Utils._
  , exec      = require('child_process').exec
  , version   = (require(__dirname + '/../package.json')).version
  , path      = require('path')
  , os        = require('os')
  , cli       = "bin/sequelize"
  ;

([
  '--url'
]).forEach(function(flag) {
  var cwd = Support.resolveSupportPath('tmp')

  var prepare = function(callback) {
    exec("rm -rf ./*", { cwd: cwd }, function(error, stdout) {
      exec(Support.getCliCommand(cwd, 'init'), { cwd: cwd }, function(error, stdout) {
        var migrationSource = Support.resolveSupportPath('assets', 'migrations')
          , migrationTarget = path.resolve(cwd, 'migrations')

        exec("cp " + migrationSource + "/*-createPerson.js " + migrationTarget + "/", function(error, stdout) {
          var dialect = Support.getTestDialect()
            , config  = require(Support.resolveSupportPath('config', 'config.js'))

          config.sqlite.storage = Support.resolveSupportPath('tmp', 'test.sqlite')
          config = _.extend(config, config[dialect], { dialect: dialect })

          var url = Support.getTestUrl(config)

          exec("echo '" + JSON.stringify(config) + "' > config/config.json", { cwd: cwd }, function(error, stdout) {
            exec(Support.getCliCommand(cwd, 'db:migrate ' + flag + "=" + url), { cwd: cwd }, callback)
          })
        })
      })
    })
  }

  describe(Support.getTestDialectTeaser(cli + " " + flag), function() {
    it("creates a SequelizeMeta table", function(done) {
      var sequelize = this.sequelize

      if (this.sequelize.options.dialect === 'sqlite') {
        var options = this.sequelize.options
        options.storage = Support.resolveSupportPath('tmp', 'test.sqlite')
        sequelize = new Support.Sequelize("", "", "", options)
      }

      prepare(function() {
        sequelize.getQueryInterface().showAllTables().success(function(tables) {
          tables = tables.sort()

          expect(tables).to.have.length(2)
          expect(tables[1]).to.equal("SequelizeMeta")
          done()
        })
      }.bind(this))
    })

    it("creates the respective table via url", function(done) {
      var sequelize = this.sequelize

      if (this.sequelize.options.dialect === 'sqlite') {
        var options = this.sequelize.options
        options.storage = Support.resolveSupportPath('tmp', 'test.sqlite')
        sequelize = new Support.Sequelize("", "", "", options)
      }

      prepare(function() {
        sequelize.getQueryInterface().showAllTables().success(function(tables) {
          tables = tables.sort()

          expect(tables).to.have.length(2)
          expect(tables[0]).to.equal("Person")
          done()
        })
      }.bind(this))
    })
  })
})
