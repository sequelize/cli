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
  'init'
]).forEach(function(flag) {
  var cwd = Support.resolveSupportPath('tmp')

  describe(Support.getTestDialectTeaser(cli + " " + flag), function() {
    ;(function(folders) {
      folders.forEach(function(folder) {
        it("creates a '" + folder + "' folder", function(done) {
          exec("rm -rf ./*", { cwd: cwd }, function() {
            exec(Support.getCliCommand(cwd, flag), { cwd: cwd }, function(err) {
              exec("ls -ila", { cwd: cwd }, function(err, stdout) {
                expect(stdout).to.contain(folder)
                done()
              })
            })
          })
        })
      })
    })(['config', 'migrations'])

    it("creates a custom migrations folder", function(done) {
      exec("rm -rf ./*", { cwd: cwd }, function() {
        exec(Support.getCliCommand(cwd, flag) + " --migrations-path ./db/migrate", { cwd: cwd }, function() {
          exec("ls -ila", { cwd: cwd }, function(err, stdout) {
            expect(stdout).to.contain('db')
            done()
          })
        })
      })
    })

    it("creates a config.json file", function(done) {
      exec("rm -rf ./*", { cwd: __dirname + '/support/tmp' }, function() {
        exec(Support.getCliCommand(cwd, flag), { cwd: cwd }, function() {
          exec("ls -ila config", { cwd: cwd }, function(err, stdout) {
            expect(stdout).to.contain('config.json')
            done()
          })
        })
      })
    })

    it("does not overwrite an existing config.json file", function(done) {
      exec("rm -rf ./*", { cwd: cwd }, function() {
        exec(Support.getCliCommand(cwd, flag), { cwd: cwd }, function() {
          exec("echo 'foo' > config/config.json", { cwd: cwd }, function() {
            exec(Support.getCliCommand(cwd, flag), { cwd: cwd }, function(err) {
              expect(err.code).to.equal(1)
              exec("cat config/config.json", { cwd: cwd }, function(err, stdout) {
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
