var expect    = require('expect.js')
  , Support   = require(__dirname + '/support')
  , dialect   = Support.getTestDialect()
  , _         = Support.Sequelize.Utils._
  , exec      = require('child_process').exec
  , version   = (require(__dirname + '/../package.json')).version
  , path      = require('path')
  , os        = require('os')
  , cli       = "bin/sequelize"

if (os.type().toLowerCase().indexOf('windows') === -1) {
  describe(Support.getTestDialectTeaser("CLI"), function() {
    ;(function(flags) {
      flags.forEach(function(flag) {
        var execBinary = function(callback, _flag) {
          _flag = _flag || flag

          var dialect = Support.getTestDialect()
            , config  = require(__dirname + '/config/config.js')

          config.sqlite.storage = __dirname + "/tmp/test.sqlite"
          config = _.extend(config, config[dialect], { dialect: dialect })

          exec("echo '" + JSON.stringify(config) + "' > config/config.json", { cwd: __dirname + '/tmp' }, function(error, stdout) {
            exec("../../bin/sequelize " + _flag, { cwd: __dirname + "/tmp" }, callback)
          })
        }

        var prepare = function(callback, options) {
          options = options || {}

          exec("rm -rf ./*", { cwd: __dirname + '/tmp' }, function(error, stdout) {
            exec("../../bin/sequelize init", { cwd: __dirname + '/tmp' }, function(error, stdout) {
              exec("cp ../assets/migrations/*-createPerson.js ./migrations/", { cwd: __dirname + '/tmp' }, function(error, stdout) {
                exec("cat ../support.js|sed s,/../,/../../, > ./support.js", { cwd: __dirname + '/tmp' }, function(error, stdout) {
                  if (!options.skipExecBinary) {
                    execBinary(callback, options.flag)
                  }
                })
              })
            })
          })
        }

        describe(flag, function() {
          it("creates a SequelizeMeta table", function(done) {
            var sequelize = this.sequelize

            if (this.sequelize.options.dialect === 'sqlite') {
              var options = this.sequelize.options
              options.storage = __dirname + "/tmp/test.sqlite"
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
              options.storage = __dirname + "/tmp/test.sqlite"
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
              options.storage = __dirname + "/tmp/test.sqlite"
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
            }.bind(this), { flag: 'migrate' })
          })
        })
      })
    })(['migrate:undo'])
  })
}
