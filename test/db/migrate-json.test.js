"use strict";

var expect    = require("expect.js");
var Support   = require(__dirname + "/../support");
var helpers   = require(__dirname + "/../support/helpers");
var gulp      = require("gulp");
var fs        = require("fs");
var _         = require("lodash");

([
  "db:migrate",
  "db:migrate --migrations-path migrations",
  "--migrations-path migrations db:migrate",
  "db:migrate --migrations-path ./migrations",
  "db:migrate --migrations-path ./migrations/",
  "db:migrate --coffee",
  "db:migrate --config ../../support/tmp/config/config.json",
  "db:migrate --config " + Support.resolveSupportPath("tmp", "config", "config.json"),
  "db:migrate --config ../../support/tmp/config/config.js"
]).forEach(function(flag) {
  var prepare = function(callback, options) {
    options = _.assign({ config: {} }, options || {});

    var configPath    = "config/";
    var migrationFile = options.migrationFile || "createPerson";
    var config        = _.assign({
      migrationStorage: "json"
    }, helpers.getTestConfig(), options.config);
    var configContent = JSON.stringify(config);

    migrationFile = migrationFile + "."  + ((flag.indexOf("coffee") === -1) ? "js" : "coffee");

    if (flag.match(/config\.js$/)) {
      configPath    = configPath + "config.js";
      configContent = "module.exports = " + configContent;
    } else {
      configPath = configPath + "config.json";
    }

    gulp
      .src(Support.resolveSupportPath("tmp"))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli("init"))
      .pipe(helpers.removeFile("config/config.json"))
      .pipe(helpers.copyMigration(migrationFile))
      .pipe(helpers.overwriteFile(configContent, configPath))
      .pipe(helpers.runCli(flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag) + " (JSON)", function() {
    describe("the migration storage file", function () {
      it("should be written to the default location", function(done) {
        var storageFile = Support.resolveSupportPath("tmp", "sequelize-meta.json");

        prepare(function() {
          expect(fs.statSync(storageFile).isFile()).to.be(true);
          expect(fs.readFileSync(storageFile).toString())
            .to.match(/^\[\n  "\d{14}-createPerson\.(js|coffee)"\n\]$/);
          done();
        });
      });

      it("should be written to the specified location", function(done) {
        var storageFile = Support.resolveSupportPath("tmp", "custom-meta.json");

        prepare(function() {
          expect(fs.statSync(storageFile).isFile()).to.be(true);
          expect(fs.readFileSync(storageFile).toString())
            .to.match(/^\[\n  "\d{14}-createPerson\.(js|coffee)"\n\]$/);
          done();
        }, { config: { migrationStoragePath: storageFile } });
      });
    });

    it("creates the respective table", function(done) {
      var self = this;

      prepare(function() {
        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(1);
          expect(tables).to.contain("Person");
          done();
        });
      });
    });

    describe("the logging option", function() {
      it("does not print sql queries by default", function(done) {
        prepare(function(_, stdout) {
          expect(stdout).to.not.contain("Executing");
          done();
        });
      });

      it("interprets a custom option", function(done) {
        prepare(function(_, stdout) {
          expect(stdout).to.contain("Executing");
          done();
        }, { config: { logging: true } });
      });
    });

    describe("promise based migrations", function () {
      it("correctly creates two tables", function (done) {
        var self = this;

        prepare(function () {
          helpers.readTables(self.sequelize, function(tables) {
            expect(tables.sort()).to.eql([
              "Person",
              "Task"
            ]);
            done();
          });
        }, {
          migrationFile: "new/*createPerson",
          config:        { promisifyMigrations: false }
        });
      });
    });
  });
});
