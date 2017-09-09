const expect    = require('expect.js');
const Support   = require(__dirname + '/../support');
const helpers   = require(__dirname + '/../support/helpers');
const gulp      = require('gulp');

[
  'seed:create'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    const seedFile = 'foo.js';

    const prepare = function (callback) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.runCli(flag + ' --name=foo'))
        .pipe(helpers.teardown(callback));
    };

    it('creates a new file with the current timestamp', done => {
      prepare(() => {
        const date        = new Date();
        const format      = function (i) {
          return parseInt(i, 10) < 10 ? '0' + i : i;
        };
        const sDate       = [
          date.getUTCFullYear(),
          format(date.getUTCMonth() + 1),
          format(date.getUTCDate()),
          format(date.getUTCHours()),
          format(date.getUTCMinutes())
        ].join('');

        const expectation = new RegExp(sDate + '..-' + seedFile);

        gulp
          .src(Support.resolveSupportPath('tmp', 'seeders'))
          .pipe(helpers.listFiles())
          .pipe(helpers.ensureContent(expectation))
          .pipe(helpers.teardown(done));
      });
    });

    it('adds a skeleton with an up and a down method', done => {
      prepare(() => {
        gulp
          .src(Support.resolveSupportPath('tmp', 'seeders'))
          .pipe(helpers.readFile('*-' + seedFile))
          .pipe(helpers.expect(stdout => {
            expect(stdout).to.contain('up: (queryInterface, Sequelize) => {');
            expect(stdout).to.contain('down: (queryInterface, Sequelize) => {');
          }))
          .pipe(helpers.teardown(done));
      });
    });
  });
});
