const expect = require('expect.js');
const Support = require(__dirname + '/../support');
const helpers = require(__dirname + '/../support/helpers');
const gulp = require('gulp');
const _ = require('lodash');

const prepare = function (flag, callback, options) {
  options = _.assign({ config: {} }, options || {});

  const configPath = 'config/config.json';
  const config = _.assign({}, helpers.getTestConfig(), options.config);
  const configContent = JSON.stringify(config);

  gulp
    .src(Support.resolveSupportPath('tmp'))
    .pipe(helpers.clearDirectory())
    .pipe(helpers.runCli('init'))
    .pipe(helpers.removeFile(configPath))
    .pipe(helpers.overwriteFile(configContent, configPath))
    .pipe(helpers.runCli(flag, { pipeStdout: true }))
    .pipe(helpers.teardown(callback));
};

describe(Support.getTestDialectTeaser('db:create'), () => {
  if (Support.dialectIsPostgres()) {
    it('correctly creates database', function (done) {
      const databaseName = `my_test_db_${_.random(10000, 99999)}`;
      prepare(
        'db:create',
        () => {
          this.sequelize.query(`SELECT 1 as exists FROM pg_database WHERE datname = '${databaseName}';`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].exists).to.eql(1);
            done();
          });
        }, {
          config: {
            database: databaseName
          }
        });
    });

    it('correctly creates database with hyphen #545', function (done) {
      const databaseName = `my_test-db_${_.random(10000, 99999)}`;
      prepare(
        'db:create',
        () => {
          this.sequelize.query(`SELECT 1 as exists FROM pg_database WHERE datname = '${databaseName}';`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].exists).to.eql(1);
            done();
          });
        }, {
          config: {
            database: databaseName
          }
        });
    });
  }

  if (Support.dialectIsMySQL()) {
    it('correctly creates database', function (done) {
      const databaseName = `my_test_db_${_.random(10000, 99999)}`;
      prepare(
        'db:create',
        () => {
          this.sequelize.query(`SELECT IF('${databaseName}' IN(SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA), 1, 0) AS found;`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].found).to.eql(1);
            done();
          });
        }, {
          config: {
            database: databaseName
          }
        });
    });

    it('correctly creates database with hyphen #545', function (done) {
      const databaseName = `my_test-db_${_.random(10000, 99999)}`;
      prepare(
        'db:create',
        () => {
          this.sequelize.query(`SELECT IF('${databaseName}' IN(SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA), 1, 0) AS found;`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].found).to.eql(1);
            done();
          });
        }, {
          config: {
            database: databaseName
          }
        });
    });
  }
});
