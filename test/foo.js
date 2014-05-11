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
  //
  //   ;(function(flags) {
  //     flags.forEach(function(flag) {
  //       var prepare = function(callback) {
  //         exec("rm -rf ./*", { cwd: __dirname + '/support/tmp' }, function(error, stdout) {
  //           exec("../../bin/sequelize --init", { cwd: __dirname + '/support/tmp' }, function(error, stdout) {
  //             exec("cp ../assets/migrations/*-createPerson.js ./migrations/", { cwd: __dirname + '/support/tmp' }, function(error, stdout) {
  //               exec("cat ../support.js|sed s,/../,/../../, > ./support.js", { cwd: __dirname + '/support/tmp' }, function(error, stdout) {
  //                 var dialect = Support.getTestDialect()
  //                   , config  = require(__dirname + '/config/config.js')
  //
  //                 config.sqlite.storage = __dirname + "/support/tmp/test.sqlite"
  //                 config = _.extend(config, config[dialect], { dialect: dialect })
  //                 var url = Support.getTestUrl(config);
  //                 exec("echo '" + JSON.stringify(config) + "' > config/config.json", { cwd: __dirname + '/support/tmp' }, function(error, stdout) {
  //                   exec("../../bin/sequelize -m " + flag + " " + url, { cwd: __dirname + "/support/tmp" }, callback)
  //                 })
  //               })
  //             })
  //           })
  //         })
  //       }
  //
  //       describe(flag, function() {
  //         it("creates a SequelizeMeta table", function(done) {
  //           var sequelize = this.sequelize
  //
  //           if (this.sequelize.options.dialect === 'sqlite') {
  //             var options = this.sequelize.options
  //             options.storage = __dirname + "/support/tmp/test.sqlite"
  //             sequelize = new Support.Sequelize("", "", "", options)
  //           }
  //
  //           prepare(function() {
  //             sequelize.getQueryInterface().showAllTables().success(function(tables) {
  //               tables = tables.sort()
  //
  //               expect(tables).to.have.length(2)
  //               expect(tables[1]).to.equal("SequelizeMeta")
  //               done()
  //             })
  //           }.bind(this))
  //         })
  //
  //         it("creates the respective table via url", function(done) {
  //           var sequelize = this.sequelize
  //
  //           if (this.sequelize.options.dialect === 'sqlite') {
  //             var options = this.sequelize.options
  //             options.storage = __dirname + "/support/tmp/test.sqlite"
  //             sequelize = new Support.Sequelize("", "", "", options)
  //           }
  //
  //           prepare(function() {
  //             sequelize.getQueryInterface().showAllTables().success(function(tables) {
  //               tables = tables.sort()
  //
  //               expect(tables).to.have.length(2)
  //               expect(tables[0]).to.equal("Person")
  //               done()
  //             })
  //           }.bind(this))
  //         })
  //       })
  //     })
  //   })(['--url', '-U'])
  //
  //   ;(function(flags) {
  //     flags.forEach(function(flag) {
  //       describe(flag, function() {
  //         it("using options file instead of cli switches", function(done) {
  //           exec("rm -rf ./*", { cwd: __dirname + '/support/tmp' }, function() {
  //             var _path = path.resolve(__dirname, 'config', 'options.js')
  //
  //             exec("../../bin/sequelize --init " + flag + " " + _path, { cwd: __dirname + '/support/tmp' }, function(err, stdout) {
  //               exec("ls -ila", { cwd: __dirname + '/support/tmp' }, function(err, stdout) {
  //                 expect(stdout).to.contain('db')
  //                 done()
  //               })
  //             })
  //           })
  //         })
  //       });
  //
  //     })
  //   })(['--options-path', '-o'])
  })
}
