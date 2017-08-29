const expect  = require('expect.js');
const Support = require(__dirname + '/../../support');
const helpers = require(__dirname + '/../../support/helpers');
const gulp    = require('gulp');
const fs      = require('fs');

[
  'db:migrate:undo'
].forEach(flag => {
  const prepare = function (callback, _flag) {
    _flag = _flag || flag;

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'))
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

    it('is correctly undoing a migration if they have been done already', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables[0]).to.equal('Person');

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

    it('correctly undoes a named migration', function (done) {
      const self = this;

      prepare(() => {
        const migrationsPath = Support.resolveSupportPath('tmp', 'migrations');
        const migrations = fs.readdirSync(migrationsPath);
        const createPersonMigration = migrations[0];

        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables[0]).to.equal('Person');

          gulp
            .src(Support.resolveSupportPath('tmp'))
            .pipe(helpers.copyMigration('emptyMigration.js'))
            .pipe(helpers.runCli('db:migrate'))
            .pipe(helpers.runCli(flag + ' --name ' + createPersonMigration, { pipeStdout: true }))
            .pipe(helpers.teardown(() => {
              helpers.readTables(self.sequelize, tables => {
                expect(tables).to.have.length(1);
                expect(tables[0]).to.equal('SequelizeMeta');
                helpers.countTable(self.sequelize, 'SequelizeMeta', count => {
                  expect(count).to.eql([{ count: 1 }]);
                  done();
                });
              });
            }));
        });
      }, 'db:migrate');
    });
  });
});
