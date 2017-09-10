const Support = require(__dirname + '/support');
const helpers = require(__dirname + '/support/helpers');
const gulp = require('gulp');
const optionsPath = Support.resolveSupportPath('config', 'options.js');

describe(Support.getTestDialectTeaser('options'), () => {
  describe('--options-path', () => {
    [
      optionsPath,
      require('path').relative(Support.resolveSupportPath('tmp'), optionsPath)
    ].forEach(path => {
      it('using options file instead of cli switches (' + path + ')', done => {
        gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.runCli('init --options-path ' + path))
          .pipe(helpers.listFiles())
          .pipe(helpers.ensureContent('models'))
          .pipe(helpers.teardown(done));
      });
    });
  });

  describe('.sequelizerc', () => {
    it('uses .sequelizerc file', done => {
      const configContent = `
        var path = require('path');

        module.exports = {
          'config':          path.resolve('config-new', 'database.json'),
          'migrations-path': path.resolve('migrations-new')
        };
      `;

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.copyFile(optionsPath, '.sequelizerc'))
        .pipe(helpers.overwriteFile(configContent, '.sequelizerc'))
        .pipe(helpers.runCli('init'))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('migrations-new'))
        .pipe(helpers.ensureContent('config-new'))
        .pipe(helpers.teardown(done));
    });

    it('prefers CLI arguments over .sequelizerc file', done => {
      const configPath = Support.resolveSupportPath('tmp', 'config', 'config.js');

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.copyFile(optionsPath, '.sequelizerc'))
        .pipe(helpers.runCli('init --config=' + configPath))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('models'))
        .pipe(helpers.teardown(done));
    });
  });
});