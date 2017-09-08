const expect  = require('expect.js');
const Support = require(__dirname + '/../../../support');
const helpers = require(__dirname + '/../../../support/helpers');
const gulp    = require('gulp');

[
  'db:migrate:undo:all --to 20130909175939-createTestTableForTrigger.js'
].forEach(flag => {
  const prepare = function (callback, _flag) {
    _flag = _flag || flag;

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.copyMigration('renamePersonToUser.js'))
      .pipe(helpers.copyMigration('createTestTableForTrigger.js'))
      .pipe(helpers.copyMigration('createPost.js'))
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

    it('is properly undoing migration with --to option and all migrations after', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(4);
          expect(tables).to.contain('User');
          expect(tables).to.contain('SequelizeMeta');
          expect(tables).to.contain('Post');
          expect(tables).to.contain('trigger_test');

          helpers.countTable(self.sequelize, 'SequelizeMeta', result => {
            expect(result[0].count).to.eql(4);

            gulp
              .src(Support.resolveSupportPath('tmp'))
              .pipe(helpers.runCli(flag, { pipeStdout: true }))
              .pipe(helpers.teardown(() => {
                helpers.readTables(self.sequelize, tables => {
                  expect(tables).to.have.length(2);
                  expect(tables).to.contain('SequelizeMeta');
                  expect(tables).to.contain('User');

                  helpers.countTable(self.sequelize, 'SequelizeMeta', result => {
                    expect(result[0].count).to.eql(2);
                    done();
                  });
                });
              }));
          });

        });
      }, 'db:migrate');
    });
  });
});
