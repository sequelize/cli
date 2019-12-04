const _ = require('lodash');
const expect = require('expect.js');
const Support = require(__dirname + '/support');
const helpers = require(__dirname + '/support/helpers');
const gulp = require('gulp');
const through = require('through2');
const sinon = require('sinon');
const sequelize = require('sequelize');

const optionsPath = Support.resolveSupportPath('config', 'options.js');

const sequelizeModulePath = require.resolve('sequelize');
const migratorModulePath = require.resolve('../src/core/migrator');
const yargsModulePath = require.resolve('../src/core/yargs');
const migrateModulePath = require.resolve('../src/commands/migrate');

describe(Support.getTestDialectTeaser('options'), () => {
  describe('--options-path', () => {
    [
      optionsPath,
      require('path').relative(Support.resolveSupportPath('tmp'), optionsPath)
    ].forEach(path => {
      it('using options file instead of cli switches (' + path + ')', done => {
        gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.runCli('init --options-path ' + path))
          .pipe(helpers.listFiles())
          .pipe(helpers.ensureContent('models'))
          .pipe(helpers.teardown(done));
      });
    });
  });

  describe('.sequelizerc', () => {
    it('uses .sequelizerc file', done => {
      const configContent = `
        var path = require('path');

        module.exports = {
          'config':          path.resolve('config-new', 'database.json'),
          'migrations-path': path.resolve('migrations-new')
        };
      `;

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.copyFile(optionsPath, '.sequelizerc'))
        .pipe(helpers.overwriteFile(configContent, '.sequelizerc'))
        .pipe(helpers.runCli('init'))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('migrations-new'))
        .pipe(helpers.ensureContent('config-new'))
        .pipe(helpers.teardown(done));
    });

    it('prefers CLI arguments over .sequelizerc file', done => {
      const configPath = Support.resolveSupportPath('tmp', 'config', 'config.js');

      gulp
        .src(Support.resolveSupportPath('tmp'))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.copyFile(optionsPath, '.sequelizerc'))
        .pipe(helpers.runCli('init --config=' + configPath))
        .pipe(helpers.listFiles())
        .pipe(helpers.ensureContent('models'))
        .pipe(helpers.teardown(done));
    });

    it('supports getting config from a function', () => {
      const configLiteral = {
        storage: Support.resolveSupportPath('tmp', 'test.sqlite'),
        dialect: 'sqlite'
      };

      return [
        `() => (${JSON.stringify(configLiteral)})`,
        `() => Promise.resolve(${JSON.stringify(configLiteral)})`
      ].reduce((p, config) => p.then(
        () => new Promise((resolve, reject) => gulp
          .src(Support.resolveSupportPath('tmp'))
          .pipe(helpers.clearDirectory())
          .pipe(helpers.copyFile(optionsPath, '.sequelizerc'))
          .pipe(helpers.overwriteFile(`exports.config = ${config}`, '.sequelizerc'))
          .pipe(helpers.createDirectory('migrations'))
          .pipe(through.obj((file, encoding, callback) => {
            sinon.stub(process, 'cwd').returns(file.path);
            sinon.stub(process, 'exit').callsFake();
            const Sequelize = sinon.spy(sequelize, 'Sequelize');

            require(migrateModulePath).handler({ _: ['db:migrate'] })
              .then(() => {
                sinon.assert.calledOnce(Sequelize);
                const sequelizeConfig = _.omit(Sequelize.args[0][0], 'logging');
                expect(sequelizeConfig).to.eql(configLiteral);
              })
              .catch(reject)
              .finally(() => {
                delete require.cache[sequelizeModulePath];
                delete require.cache[migratorModulePath];
                delete require.cache[yargsModulePath];
                delete require.cache[migrateModulePath];
                sinon.restore();
                callback(null, file);
              });
          }))
          .pipe(helpers.teardown(resolve))
        )), Promise.resolve());
    });
  });
});
