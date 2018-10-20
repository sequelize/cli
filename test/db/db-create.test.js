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

    it('correctly creates database with encoding, collate and template', function (done) {
      const databaseName = `my_test-db_${_.random(10000, 99999)}`;
      prepare(
        'db:create --encoding UTF8 --collate zh_TW.UTF-8 --template template0',
        () => {
          this.sequelize.query(`SELECT
           1 as exists,
           pg_encoding_to_char(encoding) as encoding,
           datcollate as collate,
           datctype as ctype
           FROM pg_database WHERE datname = '${databaseName}';`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].exists).to.eql(1);
            expect(result[0].encoding).to.eql('UTF8');
            expect(result[0].collate).to.eql('zh_TW.UTF-8');
            expect(result[0].ctype).to.eql('en_US.utf8');
            done();
          });
        }, {
          config: {
            database: databaseName
          }
        });
    });

    it('correctly creates database with encoding, collate, ctype and template', function (done) {
      const databaseName = `my_test-db_${_.random(10000, 99999)}`;
      prepare(
        'db:create --encoding UTF8 --collate zh_TW.UTF-8 --ctype zh_TW.UTF-8 --template template0',
        () => {
          this.sequelize.query(`SELECT
           1 as exists,
           pg_encoding_to_char(encoding) as encoding,
           datcollate as collate,
           datctype as ctype
           FROM pg_database WHERE datname = '${databaseName}';`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].exists).to.eql(1);
            expect(result[0].encoding).to.eql('UTF8');
            expect(result[0].collate).to.eql('zh_TW.UTF-8');
            expect(result[0].ctype).to.eql('zh_TW.UTF-8');
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

    it('correctly creates database with charset', function (done) {
      const databaseName = `my_test-db_${_.random(10000, 99999)}`;
      prepare(
        'db:create --charset utf8mb4',
        () => {
          this.sequelize.query(`SELECT
            DEFAULT_CHARACTER_SET_NAME as charset,
            DEFAULT_COLLATION_NAME as collation
            FROM information_schema.SCHEMATA WHERE schema_name = '${databaseName}';`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].charset).to.eql('utf8mb4');
            expect(result[0].collation).to.eql('utf8mb4_general_ci');
            done();
          });
        }, {
          config: {
            database: databaseName
          }
        });
    });
  

    it('correctly creates database with charset and collation', function (done) {
      const databaseName = `my_test-db_${_.random(10000, 99999)}`;
      prepare(
        'db:create --charset utf8mb4 --collate utf8mb4_unicode_ci',
        () => {
          this.sequelize.query(`SELECT
            DEFAULT_CHARACTER_SET_NAME as charset,
            DEFAULT_COLLATION_NAME as collation
            FROM information_schema.SCHEMATA WHERE schema_name = '${databaseName}';`, {
            type: this.sequelize.QueryTypes.SELECT
          }).then(result => {
            expect(result[0].charset).to.eql('utf8mb4');
            expect(result[0].collation).to.eql('utf8mb4_unicode_ci');
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
