const expect    = require('expect.js');
const Support   = require(__dirname + '/../support');
const helpers   = require(__dirname + '/../support/helpers');
const gulp      = require('gulp');
const fs        = require('fs');
const _         = require('lodash');

[
  'db:migrate',
  'db:migrate --migrations-path migrations',
  '--migrations-path migrations db:migrate',
  'db:migrate --migrations-path ./migrations',
  'db:migrate --migrations-path ./migrations/',
  'db:migrate --config ../../support/tmp/config/config.json',
  'db:migrate --config ' + Support.resolveSupportPath('tmp', 'config', 'config.json'),
  'db:migrate --config ../../support/tmp/config/config.js'
].forEach(flag => {
  const prepare = function (callback, options) {
    options = _.assign({ config: {} }, options || {});

    let configPath    = 'config/';
    let migrationFile = options.migrationFile || 'createPerson';
    const config        = _.assign({
      migrationStorage: 'json'
    }, helpers.getTestConfig(), options.config);
    let configContent = JSON.stringify(config);

    migrationFile = migrationFile + '.js';

    if (flag.match(/config\.js$/)) {
      configPath    = configPath + 'config.js';
      configContent = 'module.exports = ' + configContent;
    } else {
      configPath = configPath + 'config.json';
    }

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.removeFile('config/config.json'))
      .pipe(helpers.copyMigration(migrationFile))
      .pipe(helpers.overwriteFile(configContent, configPath))
      .pipe(helpers.runCli(flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag) + ' (JSON)', () => {
    describe('the migration storage file', () => {
      it('should be written to the default location', done => {
        const storageFile = Support.resolveSupportPath('tmp', 'sequelize-meta.json');

        prepare(() => {
          expect(fs.statSync(storageFile).isFile()).to.be(true);
          expect(fs.readFileSync(storageFile).toString())
            .to.match(/^\[\n  "\d{14}-createPerson\.(js)"\n\]$/);
          done();
        });
      });

      it('should be written to the specified location', done => {
        const storageFile = Support.resolveSupportPath('tmp', 'custom-meta.json');

        prepare(() => {
          expect(fs.statSync(storageFile).isFile()).to.be(true);
          expect(fs.readFileSync(storageFile).toString())
            .to.match(/^\[\n  "\d{14}-createPerson\.(js)"\n\]$/);
          done();
        }, { config: { migrationStoragePath: storageFile } });
      });
    });

    it('creates the respective table', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(1);
          expect(tables).to.contain('Person');
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

      it('interprets a custom option', done => {
        prepare((__, stdout) => {
          expect(stdout).to.contain('Executing');
          done();
        }, { config: { logging: true } });
      });
    });

    describe('promise based migrations', () => {
      it('correctly creates two tables', function (done) {
        const self = this;

        prepare(() => {
          helpers.readTables(self.sequelize, tables => {
            expect(tables.sort()).to.eql([
              'Person',
              'Task'
            ]);
            done();
          });
        }, {
          migrationFile: 'new/*createPerson',
          config:        { promisifyMigrations: false }
        });
      });
    });
  });
});
