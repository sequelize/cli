const expect  = require('expect.js');
const Support = require(__dirname + '/../../support');
const helpers = require(__dirname + '/../../support/helpers');
const gulp    = require('gulp');

[
  'db:seed:undo --seed seedPerson.js'
].forEach(flag => {
  const prepare = function (callback, options) {
    const _flag = options.flag || flag;

    const pipeline = gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'));

    if ( options.copySeeds ) {
      pipeline.pipe(helpers.copySeeder('seedPerson.js'));
    }

    pipeline.pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()),
      'config/config.json'))
      .pipe(helpers.runCli('db:migrate'))
      .pipe(helpers.runCli(_flag, { pipeStderr: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), () => {
    it('stops execution if no seeder file is found', done => {
      prepare((err, output) => {
        expect(output).to.contain('Unable to find migration');
        done();
      }, {copySeeds: false});
    });

    it('is correctly undoing a seeder if they have been done already', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables[0]).to.equal('Person');

          gulp
            .src(Support.resolveSupportPath('tmp'))
            .pipe(helpers.runCli(flag, { pipeStdout: true }))
            .pipe(helpers.teardown(() => {
              helpers.countTable(self.sequelize, 'Person', res => {
                expect(res).to.have.length(1);
                expect(res[0].count).to.eql(0);
                done();
              });
            }));
        });
      }, {flag: 'db:seed:all', copySeeds: true});
    });
  });
});
