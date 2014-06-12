var expect    = require('expect.js')
  , Support   = require(__dirname + '/support')
  , helpers   = require(__dirname + '/support/helpers')
  , gulp      = require('gulp')
  ;

([
  "help",
  "h",
  ""
]).forEach(function(flag) {
  describe(Support.getTestDialectTeaser(flag), function() {
    it("prints the help", function(done) {
      gulp
        .src(process.cwd())
        .pipe(helpers.runCli(flag, { pipeStdout: true }))
        .pipe(helpers.ensureContent("Usage\n  sequelize [task]"))
        .pipe(helpers.teardown(done))
    })
  })
})
