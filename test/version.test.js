const expect    = require('expect.js');
const Support   = require(__dirname + '/support');
const version   = (require(__dirname + '/../package.json')).version;
const helpers   = require(__dirname + '/support/helpers');
const gulp      = require('gulp');

[
  '--version'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    it('prints the version', done => {
      expect(version).to.not.be.empty;

      gulp
        .src(process.cwd())
        .pipe(helpers.runCli(flag, { pipeStdout: true }))
        .pipe(helpers.ensureContent(version))
        .pipe(helpers.teardown(done));
    });
  });
});
