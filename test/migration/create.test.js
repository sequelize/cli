'use strict';

var expect    = require('expect.js');
var Support   = require(__dirname + '/../support');
var helpers   = require(__dirname + '/../support/helpers');
var gulp      = require('gulp');
var _         = require('lodash');

([
  'migration:create',
  'migration:generate',
  'migration:create --coffee',
  'migration:generate --coffee'
]).forEach(function (flag) {
  describe(Support.getTestDialectTeaser(flag), function () {
    var migrationFile = 'foo.' + (_.includes(flag, '--coffee') ? 'coffee' : 'js');

    var prepare = function (callback) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init'))
        .pipe(helpers.runCli(flag + ' --name=foo'))
        .pipe(helpers.teardown(callback));
    };

    it('creates a new file with the current timestamp', function (done) {
      prepare(function () {
        var date        = new Date();
        var format      = function (i) {
          return (parseInt(i, 10) < 10 ? '0' + i : i);
        };
        var sDate       = [
          date.getFullYear(),
          format(date.getMonth() + 1),
          format(date.getDate()),
          format(date.getHours()),
          format(date.getMinutes())
        ].join('');
        var expectation = new RegExp(sDate + '..-' + migrationFile);

        gulp
          .src(Support.resolveSupportPath('tmp', 'migrations'))
          .pipe(helpers.listFiles())
          .pipe(helpers.ensureContent(expectation))
          .pipe(helpers.teardown(done));
      });
    });

    it('adds a skeleton with an up and a down method', function (done) {
      prepare(function () {
        gulp
          .src(Support.resolveSupportPath('tmp', 'migrations'))
          .pipe(helpers.readFile('*-' + migrationFile))
          .pipe(helpers.expect(function (stdout) {
            if (_.includes(flag, 'coffee')) {
              expect(stdout).to.contain('up: (queryInterface, Sequelize) ->');
              expect(stdout).to.contain('down: (queryInterface, Sequelize) ->');
            } else {
              expect(stdout).to.contain('up: function (queryInterface, Sequelize) {');
              expect(stdout).to.contain('down: function (queryInterface, Sequelize) {');
            }
          }))
          .pipe(helpers.teardown(done));
      });
    });
  });
});
