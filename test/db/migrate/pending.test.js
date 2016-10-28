'use strict';

var expect    = require('expect.js');
var Support   = require(__dirname + '/../../support');
var helpers   = require(__dirname + '/../../support/helpers');
var gulp      = require('gulp');
var _         = require('lodash');

describe(Support.getTestDialectTeaser('db:migrate:pending'), function () {
  describe('when there are migrations', function () {
    var prepare = function (callback, options) {
      options = _.assign({ config: {} }, options || {});
      options.cli = options.cli || {};
      _.defaults(options.cli, { pipeStdout: true });

      var config        = helpers.getTestConfig();
      var configContent = 'module.exports = ' + JSON.stringify(config);
      var result        = '';

      return gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.removeFile('config/config.json'))
        .pipe(helpers.overwriteFile(configContent, 'config/config.js'))
        .pipe(helpers.runCli('db:migrate:pending', options.cli))
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

    it('passes and reports no pending migrations', function (done) {
      prepare(function (_, stdout) {
        expect(stdout).to.contain('No pending migrations');
        done();
      }, {
        config: { logging: true }
      });
    });
  });

  describe('when there are no migrations', function () {
    var prepare = function (callback, options) {
      options = _.assign({ config: {} }, options || {});
      options.cli = options.cli || {};
      _.defaults(options.cli, { pipeStdout: true });

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
        .pipe(helpers.runCli('db:migrate:pending', options.cli))
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

    it('fails with a not 0 exit code and reports pending migrations', function (done) {
      prepare(function (_, stdout) {
        expect(stdout).to.contain('createPerson.js');
        done();
      }, {
        cli: { exitCode: 1 },
        config: { logging: true }
      });
    });
  });
});
