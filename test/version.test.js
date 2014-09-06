/* jshint -W030 */

"use strict";

var expect    = require("expect.js");
var Support   = require(__dirname + "/support");
var version   = (require(__dirname + "/../package.json")).version;
var helpers   = require(__dirname + "/support/helpers");
var gulp      = require("gulp");

([
  "version",
  "v",
  "-v",
  "-V"
]).forEach(function(flag) {
  describe(Support.getTestDialectTeaser(flag), function() {
    it("prints the version", function(done) {
      expect(version).to.not.be.empty;

      gulp
        .src(process.cwd())
        .pipe(helpers.runCli(flag, { pipeStdout: true }))
        .pipe(helpers.ensureContent(version))
        .pipe(helpers.teardown(done));
    });
  });
});
