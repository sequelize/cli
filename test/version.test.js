'use strict';

const expect    = require('expect.js');
const Support   = require('./support');
const version   = require('../package.json').version;
const helpers   = require('./support/helpers');
const gulp      = require('gulp');

[
  '--version'
].forEach(flag => {
  describe(Support.getTestDialectTeaser(flag), () => {
    it('prints the version', done => {
      expect(version).to.not.be.empty;

      gulp
        .src(process.cwd())
        .pipe(helpers.runCli(flag, { pipeStdout: true }))
        .pipe(helpers.ensureContent(version))
        .pipe(helpers.teardown(done));
    });
  });
});
