

const expect  = require('expect.js');
const Support = require(__dirname + '/../../../support');
const helpers = require(__dirname + '/../../../support/helpers');
const gulp    = require('gulp');

[
  'db:migrate:undo:all'
].forEach(flag => {
  const prepare = function (callback, _flag) {
    _flag = _flag || flag;

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.copyMigration('renamePersonToUser.js'))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), 'config/config.json'))
      .pipe(helpers.runCli(_flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), () => {
    it('creates a SequelizeMeta table', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(1);
          expect(tables[0]).to.equal('SequelizeMeta');
          done();
        });
      });
    });

    it('stops execution if no migrations have been done yet', done => {
      prepare((err, output) => {
        expect(err).to.equal(null);
        expect(output).to.contain('No executed migrations found.');
        done();
      });
    });

    it('is correctly undoing all migrations if they have been done already', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('User');
          expect(tables).to.contain('SequelizeMeta');

          gulp
            .src(Support.resolveSupportPath('tmp'))
            .pipe(helpers.runCli(flag, { pipeStdout: true }))
            .pipe(helpers.teardown(() => {
              helpers.readTables(self.sequelize, tables => {
                expect(tables).to.have.length(1);
                expect(tables[0]).to.equal('SequelizeMeta');
                done();
              });
            }));
        });
      }, 'db:migrate');
    });
  });
});
