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
        var prepare = function(callback) {
          exec("rm -rf ./*", { cwd: __dirname + '/tmp' }, function(error, stdout) {
            exec("../../bin/sequelize init", { cwd: __dirname + '/tmp' }, function(error, stdout) {
              var source = (flag.indexOf('coffee') === -1)
                ? "../assets/migrations/*-createPerson.js"
                : "../assets/migrations/*-createPerson.coffee"

              exec("cp " + source + " ./migrations/", { cwd: __dirname + '/tmp' }, function(error, stdout) {
                exec("cat ../support.js|sed s,/../,/../../, > ./support.js", { cwd: __dirname + '/tmp' }, function(error, stdout) {
                  var dialect = Support.getTestDialect()
                    , config  = require(__dirname + '/config/config.js')

                  config.sqlite.storage = __dirname + "/tmp/test.sqlite"
                  config = _.extend(config, config[dialect], { dialect: dialect })

                  exec("echo '" + JSON.stringify(config) + "' > config/config.json", { cwd: __dirname + '/tmp' }, function(error, stdout) {
                    exec("../../bin/sequelize " + flag, { cwd: __dirname + "/tmp" }, function() {
                      callback.apply(null, [].slice.apply(arguments))
                    })
                  })
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
              options.storage = __dirname + "/tmp/test.sqlite"
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
    })([
      'db:migrate',
      'db:migrate --coffee',
      'db:migrate --config ../tmp/config/config.json',
      'db:migrate --config ' + path.join(__dirname, 'tmp', 'config', 'config.json')
    ])
  })
}
