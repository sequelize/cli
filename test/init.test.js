var Support   = require(__dirname + '/support')
  , helpers   = require(__dirname + '/support/helpers')
  , gulp      = require('gulp')
  ;

([
  'init'
]).forEach(function(flag) {
  describe(Support.getTestDialectTeaser(flag), function() {
    ;(function(folders) {
      folders.forEach(function(folder) {
        it("creates a '" + folder + "' folder", function(done) {
          gulp
            .src(Support.resolveSupportPath('tmp'))
            .pipe(helpers.clearDirectory())
            .pipe(helpers.runCli(flag))
            .pipe(helpers.listFiles())
            .pipe(helpers.ensureContent(folder))
            .pipe(helpers.teardown(done))
        })
      })
    })(['config', 'migrations'])

    it("creates a custom migrations folder", function(done) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + " --migrations-path ./db/migrate"))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('db'))
        .pipe(helpers.teardown(done))
    })

    it("creates a config.json file", function(done) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag))
        .pipe(helpers.listFiles('config'))
        .pipe(helpers.ensureContent('config.json'))
        .pipe(helpers.teardown(done))
    })

    it("does not overwrite an existing config.json file", function(done) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag))
        .pipe(helpers.overwriteFile('foo', 'config/config.json'))
        .pipe(helpers.runCli(flag, { exitCode: 1 }))
        .pipe(helpers.readFile('config/config.json'))
        .pipe(helpers.ensureContent("foo\n"))
        .pipe(helpers.teardown(done))
    })
  })
})
