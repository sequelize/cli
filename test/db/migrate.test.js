

const expect    = require('expect.js');
const Support   = require(__dirname + '/../support');
const helpers   = require(__dirname + '/../support/helpers');
const gulp      = require('gulp');
const _         = require('lodash');

[
  'db:migrate',
  'db:migrate --migrations-path migrations',
  '--migrations-path migrations db:migrate',
  'db:migrate --migrations-path ./migrations',
  'db:migrate --migrations-path ./migrations/',
  'db:migrate --config ../../support/tmp/config/config.json',
  'db:migrate --config ' + Support.resolveSupportPath('tmp', 'config', 'config.json'),
  'db:migrate --config ../../support/tmp/config/config.js',
  'db:migrate --config ../../support/tmp/config/config-promise.js'
].forEach(flag => {
  const prepare = function (callback, options) {
    options = _.assign({ config: {} }, options || {});
    options.cli = options.cli || {};
    _.defaults(options.cli, { pipeStdout: true });

    let configPath    = 'config/';
    let migrationFile = options.migrationFile || 'createPerson';
    const config        = _.assign({}, helpers.getTestConfig(), options.config);
    let configContent = JSON.stringify(config);

    migrationFile = migrationFile + '.js';
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

    let result = '';

    return gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.removeFile('config/config.json'))
      .pipe(helpers.copyMigration(migrationFile))
      .pipe(helpers.overwriteFile(configContent, configPath))
      .pipe(helpers.runCli(flag, options.cli))
      .on('error', e => {
        callback(e);
      })
      .on('data', data => {
        result += data.toString();
      })
      .on('end', () => {
        callback(null, result);
      });
  };

  describe(Support.getTestDialectTeaser(flag), () => {
    it('creates a SequelizeMeta table', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('SequelizeMeta');
          done();
        });
      });
    });

    it('creates the respective table', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('Person');
          done();
        });
      });
    });

    it('fails with a not 0 exit code', done => {
      prepare(done, {
        migrationFile: 'invalid/*createPerson',
        cli: { exitCode: 1 }
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

    describe('promise based migrations', () => {
      it('correctly creates two tables', function (done) {
        const self = this;

        prepare(() => {
          helpers.readTables(self.sequelize, tables => {
            expect(tables.sort()).to.eql([
              'Person',
              'SequelizeMeta',
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

    describe('custom meta table name', () => {
      it('correctly uses the defined table name', function (done) {
        const self = this;

        prepare(() => {
          helpers.readTables(self.sequelize, tables => {
            expect(tables.sort()).to.eql(['Person', 'Task', 'sequelize_meta']);
            done();
          });
        }, {
          migrationFile: 'new/*createPerson',
          config:        { migrationStorageTableName: 'sequelize_meta' }
        });
      });
    });
  });
});

describe(Support.getTestDialectTeaser('db:migrate'), () => {
  describe('with config.js', () => {
    const prepare = function (callback) {
      const config        = helpers.getTestConfig();
      const configContent = 'module.exports = ' + JSON.stringify(config);
      let result        = '';

      return gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.removeFile('config/config.json'))
        .pipe(helpers.copyMigration('createPerson.js'))
        .pipe(helpers.overwriteFile(configContent, 'config/config.js'))
        .pipe(helpers.runCli('db:migrate'))
        .on('error', e => {
          callback(e);
        })
        .on('data', data => {
          result += data.toString();
        })
        .on('end', () => {
          callback(null, result);
        });
    };

    it('creates a SequelizeMeta table', function (done) {
      prepare(() => {
        helpers.readTables(this.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('SequelizeMeta');
          done();
        });
      });
    });

    it('creates the respective table', function (done) {
      prepare(() => {
        helpers.readTables(this.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('Person');
          done();
        });
      });
    });
  });
});

describe(Support.getTestDialectTeaser('db:migrate'), () => {
  describe('with config.json and url option', () => {
    const prepare = function (callback) {
      const config        = { url: helpers.getTestUrl() };
      const configContent = 'module.exports = ' + JSON.stringify(config);
      let result        = '';

      return gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.removeFile('config/config.json'))
        .pipe(helpers.copyMigration('createPerson.js'))
        .pipe(helpers.overwriteFile(configContent, 'config/config.js'))
        .pipe(helpers.runCli('db:migrate'))
        .on('error', e => {
          callback(e);
        })
        .on('data', data => {
          result += data.toString();
        })
        .on('end', () => {
          callback(null, result);
        });
    };

    it('creates a SequelizeMeta table', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('SequelizeMeta');
          done();
        });
      });
    });

    it('creates the respective table', function (done) {
      const self = this;

      prepare(() => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('Person');
          done();
        });
      });
    });
  });
});
