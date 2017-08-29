const expect  = require('expect.js');
const Support = require(__dirname + '/support');
const helpers = require(__dirname + '/support/helpers');
const gulp    = require('gulp');

const prepare = function (callback) {
  gulp
    .src(Support.resolveSupportPath('tmp'))
    .pipe(helpers.clearDirectory())
    .pipe(helpers.runCli('init'))
    .pipe(helpers.copyMigration('createPerson.js'))
    .pipe(
      helpers.overwriteFile(
        JSON.stringify({ use_env_variable: 'SEQUELIZE_DB_URL' }),
        'config/config.json'
      )
    )
    .pipe(helpers.runCli('db:migrate', { env: { SEQUELIZE_DB_URL: helpers.getTestUrl() } }))
    .pipe(helpers.teardown(callback));
};

describe(Support.getTestDialectTeaser('use_env_variable'), () => {
  beforeEach(prepare);

  it('correctly runs the migration', function (done) {
    helpers.readTables(this.sequelize, tables => {
      expect(tables).to.have.length(2);
      expect(tables).to.contain('SequelizeMeta');
      done();
    });
  });
});
