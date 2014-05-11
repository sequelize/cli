var expect    = require('expect.js')
  , Support   = require(__dirname + '/../support')
  , dialect   = Support.getTestDialect()
  , _         = Support.Sequelize.Utils._
  , exec      = require('child_process').exec
  , path      = require('path')
  , os        = require('os')
  , cli       = "bin/sequelize"
  ;

([
  'db:migrate',
  'db:migrate --coffee',
  'db:migrate --config ../../support/tmp/config/config.json',
  'db:migrate --config ' + Support.resolveSupportPath('tmp', 'config', 'config.json')
]).forEach(function(flag) {
  var cwd = Support.resolveSupportPath('tmp')

  var prepare = function(callback) {
    exec("rm -rf ./*", { cwd: cwd }, function(error, stdout) {
      exec(Support.getCliCommand(cwd, 'init'), { cwd: cwd }, function(error, stdout) {
        var source = (flag.indexOf('coffee') === -1)
          ? "../assets/migrations/*-createPerson.js"
          : "../assets/migrations/*-createPerson.coffee"

        exec("cp " + source + " ./migrations/", { cwd: cwd }, function(error, stdout) {
          exec("cat ../support/index.js|sed s,/../,/../../, > ./support.js", { cwd: cwd }, function(error, stdout) {
            var dialect = Support.getTestDialect()
              , config  = require(Support.resolveSupportPath('config', 'config.js'))
              , cwd     = Support.resolveSupportPath('tmp')

            config.sqlite.storage = Support.resolveSupportPath('tmp', 'test.sqlite')
            config = _.extend(config, config[dialect], { dialect: dialect })

            exec("echo '" + JSON.stringify(config) + "' > config/config.json", { cwd: cwd }, function(error, stdout) {
              exec(Support.getCliCommand(cwd, flag), { cwd: cwd }, function() {
                callback.apply(null, [].slice.apply(arguments))
              })
            })
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

    it("creates the respective table", function(done) {
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
