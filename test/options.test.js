"use strict";

var Support     = require(__dirname + "/support");
var helpers     = require(__dirname + "/support/helpers");
var gulp        = require("gulp");
var optionsPath = Support.resolveSupportPath("config", "options.js");

describe(Support.getTestDialectTeaser("--options-path"), function () {
  it("using options file instead of cli switches", function (done) {
    gulp
      .src(Support.resolveSupportPath("tmp"))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli("init --options-path " + optionsPath))
      .pipe(helpers.listFiles())
      .pipe(helpers.ensureContent("db"))
      .pipe(helpers.teardown(done));
  });
});

describe(Support.getTestDialectTeaser(".sequelizerc"), function () {
  it("uses the .sequelizerc file", function (done) {
    gulp
      .src(Support.resolveSupportPath("tmp"))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.copyFile(optionsPath, ".sequelizerc"))
      .pipe(helpers.runCli("init"))
      .pipe(helpers.listFiles())
      .pipe(helpers.ensureContent("db"))
      .pipe(helpers.teardown(done));
  });
});
