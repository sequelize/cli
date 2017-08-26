  'use strict';

var expect  = require('expect.js');
var Support = require(__dirname + '/../../../support');
var helpers = require(__dirname + '/../../../support/helpers');
var gulp    = require('gulp');
var _       = require('lodash');

([
  'db:seed:undo:all'
]).forEach(function (flag) {
  var prepare = function (callback, options) {
    var _flag  = options.flag || flag;
    var config = _.assign({}, helpers.getTestConfig(), options.config || {});

    var pipeline = gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli('init'))
      .pipe(helpers.copyMigration('createPerson.js'));

    if ( options.copySeeds ) {
      pipeline.pipe(helpers.copySeeder('seedPerson.js'))
      .pipe(helpers.copySeeder('seedPerson2.js'));
    }

    pipeline.pipe(helpers.overwriteFile(JSON.stringify(config),
      'config/config.json'))
      .pipe(helpers.runCli('db:migrate'))
      .pipe(helpers.runCli(_flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), function () {
    it('stops execution if no seeders have been found', function (done) {
      prepare(function (err, output) {
        expect(err).to.equal(null);
        expect(output).to.contain('No seeders found.');
        done();
      }.bind(this), {copySeeds: false});
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
      }, {flag: 'db:seed:all', copySeeds: true});
    });

    it('is correctly undoing all seeders when storage is none', function (done) {
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
      }, {
        flag: 'db:seed:all',
        copySeeds: true,
        config: { seederStorage: 'none' }
      });
    });
  });
});
