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
  "help",
  "h",
  ""
]).forEach(function(flag) {
  var cmd = cli + " " + flag

  describe(Support.getTestDialectTeaser(cli + " " + flag), function() {
    it("prints the help", function(done) {
      exec(Support.getCliCommand(process.cwd(), flag), function(err, stdout, stderr) {
        expect(stdout).to.contain("Usage\n  sequelize [task]")
        done()
      })
    })
  })
})
