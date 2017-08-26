'use strict';

var expect  = require('expect.js');
var Support = require(__dirname + '/support');
var helpers = require(__dirname + '/support/helpers');
var gulp    = require('gulp');

var prepare = function (callback) {
  gulp
    .src(Support.resolveSupportPath('tmp'))
    .pipe(helpers.clearDirectory())
    .pipe(helpers.runCli('init'))
    .pipe(helpers.copyMigration('createPerson.js'))
    .pipe(
      helpers.overwriteFile(
        JSON.stringify({ use_env_variable: 'SEQUELIZE_DB_URL' }),
        'config/config.json'
      )
    )
    .pipe(helpers.runCli('db:migrate', { env: { SEQUELIZE_DB_URL: helpers.getTestUrl() } }))
    .pipe(helpers.teardown(callback));
};

describe(Support.getTestDialectTeaser('use_env_variable'), function () {
  beforeEach(prepare);

  it('correctly runs the migration', function (done) {
    helpers.readTables(this.sequelize, function (tables) {
      expect(tables).to.have.length(2);
      expect(tables).to.contain('SequelizeMeta');
      done();
    });
  });
});
