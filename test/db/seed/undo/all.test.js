const expect  = require('expect.js');
const Support = require(__dirname + '/../../../support');
const helpers = require(__dirname + '/../../../support/helpers');
const gulp    = require('gulp');
const _       = require('lodash');

[
  'db:seed:undo:all'
].forEach(flag => {
  const prepare = function (callback, options) {
    const _flag  = options.flag || flag;
    const config = _.assign({}, helpers.getTestConfig(), options.config || {});

    const pipeline = gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'));

    if ( options.copySeeds ) {
      pipeline.pipe(helpers.copySeeder('seedPerson.js'))
        .pipe(helpers.copySeeder('seedPerson2.js'));
    }

    pipeline.pipe(helpers.overwriteFile(JSON.stringify(config),
      'config/config.json'))
      .pipe(helpers.runCli('db:migrate'))
      .pipe(helpers.runCli(_flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), () => {
    it('stops execution if no seeders have been found', done => {
      prepare((err, output) => {
        expect(err).to.equal(null);
        expect(output).to.contain('No seeders found.');
        done();
      }, {copySeeds: false});
    });

    it('is correctly undoing all seeders if they have been done already', function (done) {
      const self = this;

      prepare(() => {
        helpers.countTable(self.sequelize, 'Person', res => {
          expect(res).to.have.length(1);
          expect(res[0].count).to.eql(2);

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

    it('is correctly undoing all seeders when storage is none', function (done) {
      const self = this;

      prepare(() => {
        helpers.countTable(self.sequelize, 'Person', res => {
          expect(res).to.have.length(1);
          expect(res[0].count).to.eql(2);

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
      }, {
        flag: 'db:seed:all',
        copySeeds: true,
        config: { seederStorage: 'none' }
      });
    });
  });
});
