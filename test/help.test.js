const Support = require(__dirname + '/support');
const helpers = require(__dirname + '/support/helpers');
const gulp    = require('gulp');

[
  '--help'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    it('prints the help', done => {
      gulp
        .src(process.cwd())
        .pipe(helpers.runCli(flag, { pipeStdout: true }))
        .pipe(helpers.ensureContent('Commands:\n'))
        .pipe(helpers.teardown(done));
    });
  });
});
