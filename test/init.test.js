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
  describe(Support.getTestDialectTeaser(cli), function() {
    (function(flags) {
      flags.forEach(function(flag) {
        var cmd = cli + " " + flag

        describe(cmd, function() {
          ;(function(folders) {
            folders.forEach(function(folder) {
              it("creates a '" + folder + "' folder", function(done) {
                exec("rm -rf ./*", { cwd: __dirname + '/support/tmp' }, function() {
                  exec("../../../" + cmd, { cwd: __dirname + '/support/tmp' }, function() {
                    exec("ls -ila", { cwd: __dirname + '/support/tmp' }, function(err, stdout) {
                      expect(stdout).to.contain(folder)
                      done()
                    })
                  })
                })
              })
            })
          })(['config', 'migrations'])

          it("creates a custom migrations folder", function(done) {
            exec("rm -rf ./*", { cwd: __dirname + '/support/tmp' }, function() {
              exec("../../../" + cmd + " --migrations-path ./db/migrate", { cwd: __dirname + '/support/tmp' }, function() {
                exec("ls -ila", { cwd: __dirname + '/support/tmp' }, function(err, stdout) {
                  expect(stdout).to.contain('db')
                  done()
                })
              })
            })
          })

          it("creates a config.json file", function(done) {
            exec("rm -rf ./*", { cwd: __dirname + '/support/tmp' }, function() {
              exec("../../../" + cmd, { cwd: __dirname + '/support/tmp' }, function() {
                exec("ls -ila config", { cwd: __dirname + '/support/tmp' }, function(err, stdout) {
                  expect(stdout).to.contain('config.json')
                  done()
                })
              })
            })
          })

          it("does not overwrite an existing config.json file", function(done) {
            exec("rm -rf ./*", { cwd: __dirname + '/support/tmp' }, function() {
              exec("../../../" + cmd, { cwd: __dirname + '/support/tmp' }, function() {
                exec("echo 'foo' > config/config.json", { cwd: __dirname + '/support/tmp' }, function() {
                  exec("../../../" + cmd, { cwd: __dirname + '/support/tmp' }, function(err) {
                    expect(err.code).to.equal(1)
                    exec("cat config/config.json", { cwd: __dirname + '/support/tmp' }, function(err, stdout) {
                      expect(stdout).to.equal("foo\n")
                      done()
                    })
                  })
                })
              })
            })
          })
        })
      })
    })(['init'])
  })
}
