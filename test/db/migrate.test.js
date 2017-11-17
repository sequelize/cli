const fs        = require('fs');
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

describe(Support.getTestDialectTeaser('db:migrate'), () => {
  describe('optional migration parameters', () => {
    const prepare = function (runArgs = '', callback) {
      const config        = { url: helpers.getTestUrl() };
      const configContent = 'module.exports = ' + JSON.stringify(config);
      let result        = '';

      return gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.removeFile('config/config.json'))
        .pipe(helpers.copyMigration('createPerson.js'))
        .pipe(helpers.copyMigration('renamePersonToUser.js'))
        .pipe(helpers.copyMigration('createTestTableForTrigger.js'))
        .pipe(helpers.copyMigration('createPost.js'))
        .pipe(helpers.overwriteFile(configContent, 'config/config.js'))
        .pipe(helpers.runCli('db:migrate ' + runArgs))
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

    const runCli = function (cliArgs, callback) {
      let result = '';
      // avoid double callbacks
      let done = callback;
      return gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.runCli(cliArgs, { pipeStdout: true, exitCode: 0 }))
        .on('error', e => {
          done(e);
          done = () => {};
        })
        .on('data', data => {
          result += data.toString();
        })
        .on('end', () => {
          done(null, result);
        });
    };

    it('--to', function (done) {
      const self = this;
      const migrationsPath = Support.resolveSupportPath('assets', 'migrations');
      const migrations = fs.readdirSync(migrationsPath);
      const createTriggers = migrations.filter(migration => migration.indexOf('createTestTableForTrigger') > -1);

      prepare('--to ' + createTriggers, () => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(3);
          expect(tables).to.contain('User');
          expect(tables).to.contain('trigger_test');
          done();
        });
      });
    });

    it('--to full migration in two parts', function (done) {
      const self = this;
      const migrationsPath = Support.resolveSupportPath('assets', 'migrations');
      const migrations = fs.readdirSync(migrationsPath);
      const createTriggers = migrations.filter(migration => migration.indexOf('createTestTableForTrigger') > -1);
      const createPost = migrations.filter(migration => migration.indexOf('createPost') > -1);

      prepare('--to ' + createTriggers, () => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(3);
          expect(tables).to.contain('User');
          expect(tables).to.contain('trigger_test');
          runCli('db:migrate --to ' + createPost, () => {
            helpers.readTables(self.sequelize, tables => {
              expect(tables).to.have.length(4);
              expect(tables).to.contain('Post');
              done();
            });
          });
        });
      });
    });

    it('--to should exit with 0 when there are no migrations', function (done) {
      const self = this;
      const migrationsPath = Support.resolveSupportPath('assets', 'migrations');
      const migrations = fs.readdirSync(migrationsPath);
      const createTriggers = migrations.filter(migration => migration.indexOf('createTestTableForTrigger') > -1);

      prepare('--to ' + createTriggers, () => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(3);
          expect(tables).to.contain('User');
          runCli('db:migrate --to ' + createTriggers, (err, result) => {
            expect(result).to.contain('No migrations were executed, database schema was already up to date.');
            done(err);
          });
        });
      });
    });

    it('--from', function (done) {
      const self = this;
      const migrationsPath = Support.resolveSupportPath('assets', 'migrations');
      const migrations = fs.readdirSync(migrationsPath);
      const createPersonMigration = migrations.filter(migration => migration.indexOf('renamePersonToUser') > -1);

      prepare('--from ' + createPersonMigration, () => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(3);
          expect(tables).to.contain('Post');
          expect(tables).to.contain('trigger_test');
          done();
        });
      });
    });

    it('--from should exit with 0 when there are no migrations', function (done) {
      const self = this;
      const migrationsPath = Support.resolveSupportPath('assets', 'migrations');
      const migrations = fs.readdirSync(migrationsPath);
      const createPersonMigration = migrations.filter(migration => migration.indexOf('renamePersonToUser') > -1);
      const createPost = migrations.filter(migration => migration.indexOf('createPost') > -1);

      prepare('--from ' + createPersonMigration, () => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(3);
          expect(tables).to.contain('Post');
          expect(tables).to.contain('trigger_test');
          runCli('db:migrate --from ' + createPost, (err, result) => {
            expect(result).to.contain('No migrations were executed, database schema was already up to date.');
            done(err);
          });
        });
      });
    });


    it('--to and --from together', function (done) {
      const self = this;
      const migrationsPath = Support.resolveSupportPath('assets', 'migrations');
      const migrations = fs.readdirSync(migrationsPath);
      const createPersonMigration = migrations.filter(migration => migration.indexOf('renamePersonToUser') > -1);
      const createPost = migrations.filter(migration => migration.indexOf('createTestTableForTrigger') > -1);

      prepare('--from ' + createPersonMigration + ' --to ' + createPost, () => {
        helpers.readTables(self.sequelize, tables => {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('trigger_test');
          done();
        });
      });
    });
  });
});
