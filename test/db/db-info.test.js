// const expect = require('expect.js');
const Support = require(__dirname + '/../support');
const helpers = require(__dirname + '/../support/helpers');
const gulp = require('gulp');
const _ = require('lodash');

const prepare = function (flag, callback, options) {
  options = _.assign({ config: {} }, options || {});

  const configPath = 'config/config.json';
  const config = _.assign({}, helpers.getTestConfig(), options.config);
  const configContent = JSON.stringify(config);

  gulp
    .src(Support.resolveSupportPath('tmp'))
    .pipe(helpers.clearDirectory())
    .pipe(helpers.runCli('init'))
    .pipe(helpers.removeFile(configPath))
    .pipe(helpers.overwriteFile(configContent, configPath))
    .pipe(helpers.runCli(flag, { pipeStdout: true }))
    .pipe(helpers.teardown(callback));
};

['db:info'].forEach((flag) => {
  describe(Support.getTestDialectTeaser(flag), () => {
    (function (folders) {
      folders.forEach((folder) => {
        prepare(); // wip
        console.log('oo', folder);
      });
    });
  });
});
