const expect = require('expect.js');
const Support = require(__dirname + '/../support');
const helpers = require(__dirname + '/../support/helpers');
const gulp = require('gulp');
const _ = require('lodash');

['db:info'].forEach((flag) => {
  describe(Support.getTestDialectTeaser(flag), function () {
    this.timeout(5000);

    if (Support.dialectIsPostgres() || Support.dialectIsMySQL()) {
      console.log("we're testing");
      const combineFlags = function (flags) {
        let result = flag;

        _.forEach(flags || {}, (value, key) => {
          result = result + ' --' + key;
        });

        return result;
      };

      const prepare = function (options, callback) {
        options = _.assign(
          {
            flags: {},
            cli: { pipeStdout: true },
          },
          options || {}
        );

        console.log('fl', combineFlags(options.flags));

        const configPath = 'config/config.json';
        const config = _.assign(
          { password: 'secret_password' },
          helpers.getTestConfig(),
          options.config
        );
        const configContent = JSON.stringify(config);

        gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.runCli('init'))
          .pipe(helpers.runCli('db:create'))
          .pipe(
            // helpers.overwriteFile(helpers.getTestConfig(), 'config/config.json')
            helpers.overwriteFile(configContent, configPath)
          )
          .pipe(helpers.runCli(flag, { pipeStdout: true }))
          // .pipe(helpers.runCli(combineFlags(options.flags), options.cli))
          .pipe(helpers.teardown(callback));
      };

      describe('show-password', function () {
        it('hides the password', function (done) {
          prepare({}, (err, stdout) => {
            expect(stdout).to.contain('password: ***');
            done();
          });
        });

        it.only('reveals the password', function (done) {
          prepare({ flags: { 'show-password': true } }, done);
          // prepare({ flags: { showPassword: true } }, (err, stdout) => {
          //   expect(stdout).not.to.contain('password: ***');
          //   done();
          // });
        });
      });
    }
  });
});
