const expect = require('expect.js');
const Support = require(__dirname + '/../support');
const helpers = require(__dirname + '/../support/helpers');
const gulp = require('gulp');

describe(Support.getTestDialectTeaser('db:migrate --skip-execution'), () => {
  const prepare = function (callback) {
    const config = { url: helpers.getTestUrl() };
    const configContent = 'module.exports = ' + JSON.stringify(config);
    let result = '';

    return gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.removeFile('config/config.json'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.overwriteFile(configContent, 'config/config.js'))
      .pipe(helpers.runCli('db:migrate --skip-execution', { pipeStdout: true }))
      .on('error', (e) => {
        callback(e);
      })
      .on('data', (data) => {
        result += data.toString();
      })
      .on('end', () => {
        callback(null, result);
      });
  };

  beforeEach(function () {
    const queryInterface = this.sequelize.getQueryInterface();
    this.queryGenerator =
      queryInterface.queryGenerator || queryInterface.QueryGenerator;
  });

  it('marks migration as executed but does not execute it', function (done) {
    prepare((err, output) => {
      if (err) return done(err);

      helpers.readTables(this.sequelize, (tables) => {
        expect(tables).to.have.length(1);
        expect(tables).to.contain('SequelizeMeta');
        expect(tables).to.not.contain('Person');

        helpers
          .execQuery(
            this.sequelize,
            this.queryGenerator.selectQuery('SequelizeMeta'),
            { raw: true, type: 'SELECT' }
          )
          .then((items) => {
            expect(items.length).to.equal(1);
            expect(items[0].name).to.contain('createPerson');

            expect(output).to.contain('Marking migration as executed');

            done();
          })
          .catch((e) => done(e));
      });
    });
  });
});
