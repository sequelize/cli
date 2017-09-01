

const expect    = require('expect.js');
const Support   = require(__dirname + '/../support');
const helpers   = require(__dirname + '/../support/helpers');
const gulp      = require('gulp');
const fs        = require('fs');
const _         = require('lodash');

[
  'db:seed --seed seedPerson.js',
  'db:seed --seed seedPerson.js --seeders-path seeders',
  '--seeders-path seeders --seed seedPerson.js db:seed',
  'db:seed --seed seedPerson.js --seeders-path ./seeders',
  'db:seed --seed seedPerson.js --seeders-path ./seeders/',
  'db:seed --seed seedPerson.js --config ../../support/tmp/config/config.json',
  'db:seed --seed seedPerson.js --config ' +
    Support.resolveSupportPath('tmp', 'config', 'config.json'),
  'db:seed --seed seedPerson.js --config ../../support/tmp/config/config.js'
].forEach(flag => {
  const prepare = function (callback, options) {
    options = _.assign({ config: {} }, options || {});

    let configPath    = 'config/';
    let seederFile    = options.seederFile || 'seedPerson';
    const config        = _.assign({}, helpers.getTestConfig(), options.config);
    let configContent = JSON.stringify(config);
    const migrationFile = 'createPerson.js';

    seederFile = seederFile + '.js';

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
      .pipe(helpers.copySeeder(seederFile))
      .pipe(helpers.overwriteFile(configContent, configPath))
      .pipe(helpers.runCli('db:migrate' +
        (flag.indexOf('config') === -1 ? '' : flag.replace('db:seed --seed seedPerson.js', ''))
      ))
      .pipe(helpers.runCli(flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag) + ' (JSON)', () => {
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

    describe('the seeder storage file', () => {
      it('should be written to the specified location', done => {
        const storageFile = Support.resolveSupportPath('tmp', 'custom-data.json');

        prepare(() => {
          expect(fs.statSync(storageFile).isFile()).to.be(true);
          expect(fs.readFileSync(storageFile).toString())
            .to.match(/^\[\n  "seedPerson\.(js)"\n\]$/);
          done();
        }, { config: { seederStoragePath: storageFile, seederStorage: 'json' } });
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
  });
});
