'use strict';

var Support = require(__dirname + '/support');
var helpers = require(__dirname + '/support/helpers');
var gulp    = require('gulp');

([
  'init'
]).forEach(function (flag) {
  describe(Support.getTestDialectTeaser(flag), function () {
    (function (folders) {
      folders.forEach(function (folder) {
        it('creates "' + folder + '"', function (done) {
          var sourcePath = Support.resolveSupportPath('tmp');
          var file       = folder;

          if (folder.indexOf('/') > -1) {
            var split = folder.split('/');

            file = split.pop();
            sourcePath = Support.resolveSupportPath('tmp', split.join('/'));
          }

          gulp
            .src(Support.resolveSupportPath('tmp'))
            .pipe(helpers.clearDirectory())
            .pipe(helpers.runCli(flag))
            .pipe(helpers.teardown(function () {
              gulp
                .src(sourcePath)
                .pipe(helpers.listFiles())
                .pipe(helpers.ensureContent(file))
                .pipe(helpers.teardown(done));
            }));
        });
      });
    })([
      'config',
      'config/config.json',
      'migrations',
      'models',
      'models/index.js'
    ]);

    it('creates a custom migrations folder', function (done) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + ' --migrations-path ./db/migrate'))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('db'))
        .pipe(helpers.teardown(done));
    });

    it('creates a custom config file', function (done) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + ' --config config/database.json'))
        .pipe(helpers.teardown(function () {
          gulp
            .src(Support.resolveSupportPath('tmp', 'config'))
            .pipe(helpers.listFiles())
            .pipe(helpers.ensureContent('database.json'))
            .pipe(helpers.teardown(done));
        }));
    });

    it('creates a custom models folder', function (done) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + ' --models-path daos'))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('daos'))
        .pipe(helpers.teardown(done));
    });

    describe('models/index.js', function () {
      it('correctly injects the reference to the default config file', function (done) {
        gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.runCli(flag))
          .pipe(helpers.teardown(function () {
            gulp
              .src(Support.resolveSupportPath('tmp', 'models'))
              .pipe(helpers.readFile('index.js'))
              .pipe(helpers.ensureContent('__dirname + \'/../config/config.json\''))
              .pipe(helpers.teardown(done));
          }));
      });

      it('correctly injects the reference to the custom config file', function (done) {
        gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.runCli(flag + ' --config my/configuration-file.json'))
          .pipe(helpers.teardown(function () {
            gulp
              .src(Support.resolveSupportPath('tmp', 'models'))
              .pipe(helpers.readFile('index.js'))
              .pipe(helpers.ensureContent('__dirname + \'/../my/configuration-file.json\''))
              .pipe(helpers.teardown(done));
          }));
      });
    });

    it('does not overwrite an existing config.json file', function (done) {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag))
        .pipe(helpers.overwriteFile('foo', 'config/config.json'))
        .pipe(helpers.runCli(flag, { exitCode: 1 }))
        .pipe(helpers.readFile('config/config.json'))
        .pipe(helpers.ensureContent('foo'))
        .pipe(helpers.teardown(done));
    });
  });
});
