var expect    = require('expect.js')
  , Support   = require(__dirname + '/../../support')
  , dialect   = Support.getTestDialect()
  , _         = Support.Sequelize.Utils._
  , exec      = require('child_process').exec
  , version   = (require(__dirname + '/../../../package.json')).version
  , path      = require('path')
  , os        = require('os')
  , cli       = "bin/sequelize"
  ;

([
  'db:migrate:undo'
]).forEach(function(flag) {
  var execBinary = function(callback, _flag) {
    _flag = _flag || flag

    var dialect = Support.getTestDialect()
      , config  = require(Support.resolveSupportPath('config', 'config.js'))
      , cwd     = Support.resolveSupportPath('tmp')

    config.sqlite.storage = Support.resolveSupportPath('tmp', 'test.sqlite')
    config = _.extend(config, config[dialect], { dialect: dialect })

    exec("echo '" + JSON.stringify(config) + "' > config/config.json", { cwd: cwd }, function(error, stdout) {
      exec(Support.getCliCommand(cwd, _flag), { cwd: cwd }, callback)
    })
  }

  var prepare = function(callback, options) {
    var cwd = Support.resolveSupportPath('tmp')

    options = options || {}

    exec("rm -rf ./*", { cwd: cwd }, function(error, stdout) {
      exec(Support.getCliCommand(cwd, 'init'), { cwd: cwd }, function(error, stdout) {
        var migrationSource = Support.resolveSupportPath('assets', 'migrations')
        exec("cp " + migrationSource + "/*-createPerson.js ./migrations/", { cwd: cwd }, function(error, stdout) {
          if (!options.skipExecBinary) {
            execBinary(callback, options.flag)
          }
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

          expect(tables).to.have.length(1)
          expect(tables[0]).to.equal("SequelizeMeta")
          done()
        })
      }.bind(this))
    })

    it("stops execution if no migrations have been done yet", function(done) {
      var sequelize = this.sequelize

      if (this.sequelize.options.dialect === 'sqlite') {
        var options = this.sequelize.options
        options.storage = Support.resolveSupportPath('tmp', 'test.sqlite')
        sequelize = new Support.Sequelize("", "", "", options)
      }

      prepare(function(err, output) {
        expect(err).to.be.null
        expect(output).to.contain("There are no pending migrations.")
        done()
      }.bind(this))
    })

    it("is correctly undoing a migration if they have been done yet", function(done) {
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

          execBinary(function(err, output) {
            sequelize.getQueryInterface().showAllTables().success(function(tables) {
              expect(tables).to.have.length(1)
              expect(tables[0]).to.equal("SequelizeMeta")

              done()
            })
          })
        })
      }.bind(this), { flag: 'db:migrate' })
    })
  })
})
