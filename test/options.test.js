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
  '--options-path'
]).forEach(function(flag) {
  var cwd = Support.resolveSupportPath('tmp')

  describe(Support.getTestDialectTeaser(cli + " " + flag), function() {
    it("using options file instead of cli switches", function(done) {
      exec("rm -rf ./*", { cwd: cwd }, function() {
        var _path = path.resolve(__dirname, 'support', 'config', 'options.js')

        exec(Support.getCliCommand(cwd, 'init ' + flag + ' ' + _path), { cwd: cwd }, function(err, stdout) {
          exec("ls -ila", { cwd: cwd }, function(err, stdout) {
            expect(stdout).to.contain('db')
            done()
          })
        })
      })
    })
  })
})
