'use strict';

var expect    = require('expect.js');
var Support   = require(__dirname + '/support');
var helpers   = require(__dirname + '/support/helpers');
var gulp      = require('gulp');

([
  '--url'
]).forEach(function (flag) {
  var prepare = function (callback) {
    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), 'config/config.json'))
      .pipe(helpers.runCli('db:migrate ' + flag + '=' + helpers.getTestUrl(), { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), function () {
    beforeEach(function (done) {
      prepare(function (err, stdout) {
        this.stdout = stdout;
        done();
      }.bind(this));
    });

    it('creates a SequelizeMeta table', function (done) {
      helpers.readTables(this.sequelize, function (tables) {
        expect(tables).to.have.length(2);
        expect(tables).to.contain('SequelizeMeta');
        done();
      });
    });

    it('creates the respective table via url', function (done) {
      helpers.readTables(this.sequelize, function (tables) {
        expect(tables).to.have.length(2);
        expect(tables).to.contain('Person');
        done();
      });
    });

    it('prints the parsed URL', function () {
      expect(this.stdout).to.contain('Parsed url');
    });

    it('filters the password', function () {
      var config = helpers.getTestConfig();

      if (Support.getTestDialect() === 'sqlite') {
        return;
      }

      expect(this.stdout).to.contain(
        config.dialect + '://' + config.username + ':*****@' + config.host +
        ':' + config.port + '/' + config.database
      );
    });
  });
});
