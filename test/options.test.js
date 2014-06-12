var expect    = require('expect.js')
  , Support   = require(__dirname + '/support')
  , path      = require('path')
  , helpers   = require(__dirname + '/support/helpers')
  , gulp      = require('gulp')
  ;

([
  '--options-path'
]).forEach(function(flag) {
  describe(Support.getTestDialectTeaser(flag), function() {
    it("using options file instead of cli switches", function(done) {
      var optionsPath = Support.resolveSupportPath('config', 'options.js')

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init ' + flag + ' ' + optionsPath))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('db'))
        .pipe(helpers.teardown(done))
    })
  })
})
