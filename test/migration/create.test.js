const expect    = require('expect.js');
const Support   = require(__dirname + '/../support');
const helpers   = require(__dirname + '/../support/helpers');
const gulp      = require('gulp');
const _         = require('lodash');

const getDateStrYYYYMMDDHHmm = () => {
  const date        = new Date();
  const format      = function (i) {
    return parseInt(i, 10) < 10 ? '0' + i : i;
  };
  return [
    date.getUTCFullYear(),
    format(date.getUTCMonth() + 1),
    format(date.getUTCDate()),
    format(date.getUTCHours()),
    format(date.getUTCMinutes())
  ].join('');
};

[
  'migration:create'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    const migrationFile = 'foo.js';
    const flags = {
      name: 'foo'
    };
    const prepare = function (options, callback) {
      options = _.assign({
        flags: {},
        cli:   { pipeStdout: true }
      }, options || {});

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.runCli(helpers.buildCommand(flag, options.flags), options.cli))
        .pipe(helpers.teardown(callback));
    };

    it('creates a new file with the current timestamp', done => {
      prepare({ flags }, () => {
        const expectation = new RegExp(getDateStrYYYYMMDDHHmm() + '\\d{2}-' + migrationFile);

        gulp
          .src(Support.resolveSupportPath('tmp', 'migrations'))
          .pipe(helpers.listFiles())
          .pipe(helpers.ensureContent(expectation))
          .pipe(helpers.teardown(done));
      });
    });

    describe('--filename-date-format flag', () => {
      it('creates a new file with the YYYYMMDDHHmms date format', done => {
        prepare({
          flags: _.assign({
            'filename-date-format': 'dateYYYYMMDDHHmms'
          }, flags)
        }, () => {
          const expectation = new RegExp(getDateStrYYYYMMDDHHmm() + '\\d{2}-' + migrationFile);

          gulp
            .src(Support.resolveSupportPath('tmp', 'migrations'))
            .pipe(helpers.listFiles())
            .pipe(helpers.ensureContent(expectation))
            .pipe(helpers.teardown(done));
        });
      });

      it('creates new file with unix-timestamp format', done => {
        prepare({
          flags: _.assign({
            'filename-date-format': 'unix-timestamp'
          }, flags)
        }, () => {
          const timestamp   = Math.round(Date.now() / 1000);
          const expectation = new RegExp(timestamp + '-' + migrationFile);

          gulp
            .src(Support.resolveSupportPath('tmp', 'migrations'))
            .pipe(helpers.listFiles())
            .pipe(helpers.ensureContent(expectation))
            .pipe(helpers.teardown(done));
        });
      });

      it('creates new file with unix-timestamp-millis format', done => {
        prepare({
          flags: _.assign({
            'filename-date-format': 'unix-timestamp-millis'
          }, flags)
        }, () => {
          const timestamp   = Date.now().toString().substr(0, 9);
          const expectation = new RegExp(timestamp + '\\d{4}-' + migrationFile);

          gulp
            .src(Support.resolveSupportPath('tmp', 'migrations'))
            .pipe(helpers.listFiles())
            .pipe(helpers.ensureContent(expectation))
            .pipe(helpers.teardown(done));
        });
      });

      it('fails on unknown filename date format value', done => {
        prepare({
          flags: _.assign({
            'filename-date-format': 'bar'
          }, flags),
          cli: { pipeStderr: true }
        }, (_, stdout) => {
          expect(stdout).to.match(
            /Argument: filename-date-format, Given: "bar", Choices: "dateYYYYMMDDHHmms", "unix-timestamp", "unix-timestamp-millis"/
          );
          done();
        });
      });
    });

    it('adds a skeleton with an up and a down method', done => {
      prepare({ flags }, () => {
        gulp
          .src(Support.resolveSupportPath('tmp', 'migrations'))
          .pipe(helpers.readFile('*-' + migrationFile))
          .pipe(helpers.expect(stdout => {
            expect(stdout).to.contain('up: (queryInterface, Sequelize) => {');
            expect(stdout).to.contain('down: (queryInterface, Sequelize) => {');
          }))
          .pipe(helpers.teardown(done));
      });
    });
  });
});
