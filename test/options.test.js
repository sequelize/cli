'use strict';

var Support     = require(__dirname + '/support');
var helpers     = require(__dirname + '/support/helpers');
var gulp        = require('gulp');
var optionsPath = Support.resolveSupportPath('config', 'options.js');

describe(Support.getTestDialectTeaser('--options-path'), function () {
  [
    optionsPath,
    require('path').relative(Support.resolveSupportPath('tmp'), optionsPath)
  ].forEach(function (path) {
    it('using options file instead of cli switches (' + path + ')', function (done) {
      console.log(path);
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli('init --options-path ' + path))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('db'))
        .pipe(helpers.teardown(done));
    });
  });
});

describe(Support.getTestDialectTeaser('.sequelizerc'), function () {
  it('uses the .sequelizerc file', function (done) {
    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.copyFile(optionsPath, '.sequelizerc'))
      .pipe(helpers.runCli('init'))
      .pipe(helpers.listFiles())
      .pipe(helpers.ensureContent('db'))
      .pipe(helpers.teardown(done));
  });

  it('prefers the CLI arguments over the sequelizerc file', function (done) {
    var configPath = Support.resolveSupportPath('tmp', 'config', 'config.js');

    gulp
      .src(Support.resolveSupportPath('tmp'))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.copyFile(optionsPath, '.sequelizerc'))
      .pipe(helpers.runCli('init --config=' + configPath))
      .pipe(helpers.listFiles())
      .pipe(helpers.ensureContent('db'))
      .pipe(helpers.teardown(done));
  });
});
