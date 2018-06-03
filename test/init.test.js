const Support = require(__dirname + '/support');
const helpers = require(__dirname + '/support/helpers');
const gulp    = require('gulp');

[
  'init'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    (function (folders) {
      folders.forEach(folder => {
        it('creates "' + folder + '"', done => {
          let sourcePath = Support.resolveSupportPath('tmp');
          let file       = folder;

          if (folder.indexOf('/') > -1) {
            const split = folder.split('/');

            file = split.pop();
            sourcePath = Support.resolveSupportPath('tmp', split.join('/'));
          }

          gulp
            .src(Support.resolveSupportPath('tmp'))
            .pipe(helpers.clearDirectory())
            .pipe(helpers.runCli(flag))
            .pipe(helpers.teardown(() => {
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

    it('creates a custom config folder', done => {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + ' --config my-config/config/config.json'))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('my-config'))
        .pipe(helpers.teardown(done));
    });

    it('creates a custom migrations folder', done => {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + ' --migrations-path ./db/migrate'))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('db'))
        .pipe(helpers.teardown(done));
    });

    it('creates a custom config file', done => {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + ' --config config/database.json'))
        .pipe(helpers.teardown(() => {
          gulp
            .src(Support.resolveSupportPath('tmp', 'config'))
            .pipe(helpers.listFiles())
            .pipe(helpers.ensureContent('database.json'))
            .pipe(helpers.teardown(done));
        }));
    });

    it('creates a custom models folder', done => {
      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli(flag + ' --models-path daos'))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('daos'))
        .pipe(helpers.teardown(done));
    });

    describe('models/index.js', () => {
      it('correctly injects the reference to the default config file', done => {
        const path = Support.isWindows()
          ? '__dirname + \'/..\\config\\config.json\''
          : '__dirname + \'/../config/config.json\'';

        gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.runCli(flag))
          .pipe(helpers.teardown(() => {
            gulp
              .src(Support.resolveSupportPath('tmp', 'models'))
              .pipe(helpers.readFile('index.js'))
              .pipe(helpers.ensureContent(path))
              .pipe(helpers.teardown(done));
          }));
      });

      it('correctly injects the reference to the custom config file', done => {
        const path = Support.isWindows()
          ? '__dirname + \'/..\\my\\configuration-file.json\''
          : '__dirname + \'/../my/configuration-file.json\'';

        gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.runCli(flag + ' --config my/configuration-file.json'))
          .pipe(helpers.teardown(() => {
            gulp
              .src(Support.resolveSupportPath('tmp', 'models'))
              .pipe(helpers.readFile('index.js'))
              .pipe(helpers.ensureContent(path))
              .pipe(helpers.teardown(done));
          }));
      });
    });

    it('does not overwrite an existing config.json file', done => {
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
