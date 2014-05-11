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
  'version',
  'v',
  '-v',
  '-V'
]).forEach(function(flag) {
  describe(Support.getTestDialectTeaser(cli + " " + flag), function() {
    it("prints the version", function(done) {
      exec(Support.getCliCommand(process.cwd(), flag), function(err, stdout, stderr) {
        expect(version).to.not.be.empty
        expect(stdout).to.contain(version)
        done()
      })
    })
  })
})
