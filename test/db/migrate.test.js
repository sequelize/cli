'use strict';

var expect    = require('expect.js');
var Support   = require(__dirname + '/../support');
var helpers   = require(__dirname + '/../support/helpers');
var gulp      = require('gulp');
var _         = require('lodash');

([
  'db:migrate',
  'db:migrate --migrations-path migrations',
  '--migrations-path migrations db:migrate',
  'db:migrate --migrations-path ./migrations',
  'db:migrate --migrations-path ./migrations/',
  'db:migrate --coffee',
  'db:migrate --config ../../support/tmp/config/config.json',
  'db:migrate --config ' + Support.resolveSupportPath('tmp', 'config', 'config.json'),
  'db:migrate --config ../../support/tmp/config/config.js',
  'db:migrate --config ../../support/tmp/config/config-promise.js'
]).forEach(function (flag) {
  var prepare = function (callback, options) {
    options = _.assign({ config: {} }, options || {});
    options.cli = options.cli || {};
    _.defaults(options.cli, { pipeStdout: true });

    var configPath    = 'config/';
    var migrationFile = options.migrationFile || 'createPerson';
    var config        = _.assign({}, helpers.getTestConfig(), options.config);
    var configContent = JSON.stringify(config);

    migrationFile = migrationFile + '.'  + ((flag.indexOf('coffee') === -1) ? 'js' : 'coffee');

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

    var result = '';

    return gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.removeFile('config/config.json'))
      .pipe(helpers.copyMigration(migrationFile))
      .pipe(helpers.overwriteFile(configContent, configPath))
      .pipe(helpers.runCli(flag, options.cli))
      .on('error', function (e) {
        callback(e);
      })
      .on('data', function (data) {
        result += data.toString();
      })
      .on('end', function () {
        callback(null, result);
      });
  };

  describe(Support.getTestDialectTeaser(flag), function () {
    it('creates a SequelizeMeta table', function (done) {
      var self = this;

      prepare(function () {
        helpers.readTables(self.sequelize, function (tables) {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('SequelizeMeta');
          done();
        });
      });
    });

    it('creates the respective table', function (done) {
      var self = this;

      prepare(function () {
        helpers.readTables(self.sequelize, function (tables) {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('Person');
          done();
        });
      });
    });

    it('fails with a not 0 exit code', function (done) {
      prepare(done, {
        migrationFile: 'invalid/*createPerson',
        cli: { exitCode: 1 }
      });
    });

    describe('the logging option', function () {
      it('does not print sql queries by default', function (done) {
        prepare(function (_, stdout) {
          expect(stdout).to.not.contain('Executing');
          done();
        });
      });

      it('interpretes a custom option', function (done) {
        prepare(function (_, stdout) {
          expect(stdout).to.contain('Executing');
          done();
        }, { config: { logging: true } });
      });
    });

    describe('promise based migrations', function () {
      it('correctly creates two tables', function (done) {
        var self = this;

        prepare(function () {
          helpers.readTables(self.sequelize, function (tables) {
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

    describe('custom meta table name', function () {
      it('correctly uses the defined table name', function (done) {
        var self = this;

        prepare(function () {
          helpers.readTables(self.sequelize, function (tables) {
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

describe(Support.getTestDialectTeaser('db:migrate'), function () {
  describe('with config.js', function () {
    var prepare = function (callback) {
      var config        = helpers.getTestConfig();
      var configContent = 'module.exports = ' + JSON.stringify(config);
      var result        = '';

      return gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.removeFile('config/config.json'))
        .pipe(helpers.copyMigration('createPerson.js'))
        .pipe(helpers.overwriteFile(configContent, 'config/config.js'))
        .pipe(helpers.runCli('db:migrate'))
        .on('error', function (e) {
          callback(e);
        })
        .on('data', function (data) {
          result += data.toString();
        })
        .on('end', function () {
          callback(null, result);
        });
    };

    it('creates a SequelizeMeta table', function (done) {
      var self = this;

      prepare(function () {
        helpers.readTables(self.sequelize, function (tables) {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('SequelizeMeta');
          done();
        });
      });
    });

    it('creates the respective table', function (done) {
      var self = this;

      prepare(function () {
        helpers.readTables(self.sequelize, function (tables) {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('Person');
          done();
        });
      });
    });
  });
});

describe(Support.getTestDialectTeaser('db:migrate'), function () {
  describe('with config.json and url option', function () {
    var prepare = function (callback) {
      var config        = { url: helpers.getTestUrl() };
      var configContent = 'module.exports = ' + JSON.stringify(config);
      var result        = '';

      return gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.removeFile('config/config.json'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.overwriteFile(configContent, 'config/config.js'))
      .pipe(helpers.runCli('db:migrate'))
      .on('error', function (e) {
        callback(e);
      })
      .on('data', function (data) {
        result += data.toString();
      })
      .on('end', function () {
        callback(null, result);
      });
    };

    it('creates a SequelizeMeta table', function (done) {
      var self = this;

      prepare(function () {
        helpers.readTables(self.sequelize, function (tables) {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('SequelizeMeta');
          done();
        });
      });
    });

    it('creates the respective table', function (done) {
      var self = this;

      prepare(function () {
        helpers.readTables(self.sequelize, function (tables) {
          expect(tables).to.have.length(2);
          expect(tables).to.contain('Person');
          done();
        });
      });
    });
  });
});
