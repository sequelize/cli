  'use strict';

var expect  = require('expect.js');
var Support = require(__dirname + '/../../../support');
var helpers = require(__dirname + '/../../../support/helpers');
var gulp    = require('gulp');

([
  'db:seed:undo:all'
]).forEach(function (flag) {
  var prepare = function (callback, _flag) {
    _flag = _flag || flag;

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'))
      .pipe(helpers.copySeeder('seedPerson.js'))
      .pipe(helpers.copySeeder('seedPerson2.js'))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), 'config/config.json'))
      .pipe(helpers.runCli('db:migrate'))
      .pipe(helpers.runCli(_flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), function () {
    it('creates a SequelizeData table', function (done) {
      var self = this;

      prepare(function () {
        helpers.readTables(self.sequelize, function (tables) {
          expect(tables).to.have.length(3);
          expect(tables[1]).to.equal('SequelizeData');
          done();
        });
      });
    });

    it('stops execution if no seeders have been done yet', function (done) {
      prepare(function (err, output) {
        expect(err).to.equal(null);
        expect(output).to.contain('No executed seeders found.');
        done();
      }.bind(this));
    });

    it('is correctly undoing all seeders if they have been done already', function (done) {
      var self = this;

      prepare(function () {
        helpers.countTable(self.sequelize, 'Person', function (res) {
          expect(res).to.have.length(1);
          expect(res[0].count).to.eql(2);

          gulp
            .src(Support.resolveSupportPath('tmp'))
            .pipe(helpers.runCli(flag, { pipeStdout: true }))
            .pipe(helpers.teardown(function () {
              helpers.countTable(self.sequelize, 'Person', function (res) {
                expect(res).to.have.length(1);
                expect(res[0].count).to.eql(0);
                done();
              });
            }));
        });
      }, 'db:seed');
    });
  });
});
