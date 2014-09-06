"use strict";

var expect    = require("expect.js");
var Support   = require(__dirname + "/support");
var helpers   = require(__dirname + "/support/helpers");
var gulp      = require("gulp");

([
  "--url"
]).forEach(function(flag) {
  var prepare = function(callback) {
    gulp
      .src(Support.resolveSupportPath("tmp"))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli("init"))
      .pipe(helpers.copyMigration("createPerson.js"))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), "config/config.json"))
      .pipe(helpers.runCli("db:migrate " + flag + "=" + helpers.getTestUrl()))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), function() {
    beforeEach(function(done) {
      prepare(done);
    });

    it("creates a SequelizeMeta table", function(done) {
      helpers.readTables(this.sequelize, function(tables) {
        expect(tables).to.have.length(2);
        expect(tables).to.contain("SequelizeMeta");
        done();
      });
    });

    it("creates the respective table via url", function(done) {
      helpers.readTables(this.sequelize, function(tables) {
        expect(tables).to.have.length(2);
        expect(tables).to.contain("Person");
        done();
      });
    });
  });
});
