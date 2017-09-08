

const Support = require(__dirname + '/../../support');
const helpers = require(__dirname + '/../../support/helpers');
const gulp    = require('gulp');

[
  'db:migrate:status'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    it('is correctly reports a down and an up migration', done => {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.copyMigration('createPerson.js'))
        .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), 'config/config.json'))
        .pipe(helpers.runCli('db:migrate', { pipeStdout: false }))
        .pipe(helpers.copyMigration('renamePersonToUser.js'))
        .pipe(helpers.runCli(flag, { pipeStdout: true }))
        .pipe(helpers.ensureContent('up 20111117063700-createPerson.js'))
        .pipe(helpers.ensureContent('down 20111205064000-renamePersonToUser.js'))
        .pipe(helpers.teardown(done));
    });
  });
});
