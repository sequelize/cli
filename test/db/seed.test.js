

const expect    = require('expect.js');
const Support   = require(__dirname + '/../support');
const helpers   = require(__dirname + '/../support/helpers');
const gulp      = require('gulp');
const _         = require('lodash');

[
  'db:seed --seed seedPerson.js',
  'db:seed --seeders-path seeders --seed seedPerson.js',
  '--seeders-path seeders db:seed --seed seedPerson.js',
  'db:seed --seeders-path ./seeders --seed seedPerson.js',
  'db:seed --seeders-path ./seeders/ --seed seedPerson.js',
  'db:seed --seed seedPerson.js --config ../../support/tmp/config/config.json',
  'db:seed --seed seedPerson.js --config ' +
    Support.resolveSupportPath('tmp', 'config', 'config.json'),
  'db:seed --seed seedPerson.js --config ../../support/tmp/config/config.js',
  'db:seed --seed seedPerson.js --config ../../support/tmp/config/config-promise.js'
].forEach(flag => {
  const prepare = function (callback, options) {
    options = _.assign({ config: {} }, options || {});

    let configPath    = 'config/';
    let seederFile    = 'seedPerson';
    const config        = _.assign({}, helpers.getTestConfig(), options.config);
    let configContent = JSON.stringify(config);
    const migrationFile = 'createPerson.js';

    seederFile = seederFile + '.js';

    if (flag.match(/config\.js$/)) {
      configPath    = configPath + 'config.js';
      configContent = 'module.exports = ' + configContent;
    } else if (flag.match(/config-promise\.js/)) {
      configPath    = configPath + 'config-promise.js';
      configContent = '' +
        'var b = require("bluebird");' +
        'module.exports = b.resolve(' + configContent + ');';
    } else {
      configPath = configPath + 'config.json';
    }

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.removeFile('config/config.json'))
      .pipe(helpers.copyMigration(migrationFile))
      .pipe(helpers.copySeeder(seederFile))
      .pipe(helpers.overwriteFile(configContent, configPath))
      .pipe(helpers.runCli('db:migrate' +
        (flag.indexOf('config') === -1 ? '' : flag.replace('db:seed --seed seedPerson.js', ''))
      ))
      .pipe(helpers.runCli(flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), () => {
    it('creates a SequelizeData table', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(3);
          expect(tables).to.contain('SequelizeData');
          done();
        });
      }, { config: { seederStorage: 'sequelize' } });
    });

    it('populates the respective table', function (done) {
      const self = this;

      prepare(() => {
        helpers.countTable(self.sequelize, 'Person', result => {
          expect(result).to.have.length(1);
          expect(result[0].count).to.eql(1);
          done();
        });
      });
    });

    describe('the logging option', () => {
      it('does not print sql queries by default', done => {
        prepare((__, stdout) => {
          expect(stdout).to.not.contain('Executing');
          done();
        });
      });

      it('interpretes a custom option', done => {
        prepare((__, stdout) => {
          expect(stdout).to.contain('Executing');
          done();
        }, { config: { logging: true } });
      });
    });

    describe('custom meta table name', () => {
      it('correctly uses the defined table name', function (done) {
        const self = this;

        prepare(() => {
          helpers.readTables(self.sequelize, tables => {
            expect(tables.sort()).to.eql(['Person', 'SequelizeMeta', 'sequelize_data']);
            done();
          });
        }, {
          config: { seederStorage: 'sequelize', seederStorageTableName: 'sequelize_data' }
        });
      });
    });
  });
});
