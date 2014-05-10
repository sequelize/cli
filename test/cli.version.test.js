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
    (function(flags) {
      flags.forEach(function(flag) {
        var cmd = cli + " " + flag

        describe(cmd, function() {
          it("prints the version", function(done) {
            exec(cmd, function(err, stdout, stderr) {
              expect(version).to.not.be.empty
              expect(stdout).to.contain(version)
              done()
            })
          })
        })
      })
    })(['version', 'v'])
  })
}
