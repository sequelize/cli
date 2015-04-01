"use strict";

var expect    = require("expect.js");
var Support   = require(__dirname + "/../support");
var helpers   = require(__dirname + "/../support/helpers");
var gulp      = require("gulp");
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
    var config        = _.assign({}, helpers.getTestConfig(), options.config);
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

  describe(Support.getTestDialectTeaser(flag), function() {
    it("creates a SequelizeMeta table", function(done) {
      var self = this;

      prepare(function() {
        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(2);
          expect(tables).to.contain("SequelizeMeta");
          done();
        });
      });
    });

    it("creates the respective table", function(done) {
      var self = this;

      prepare(function() {
        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(2);
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

      it("interpretes a custom option", function(done) {
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
              "SequelizeMeta",
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

    describe("custom meta table name", function () {
      it("correctly uses the defined table name", function (done) {
        var self = this;

        prepare(function () {
          helpers.readTables(self.sequelize, function(tables) {
            expect(tables.sort()).to.eql(["Person", "Task", "sequelize_meta"]);
            done();
          });
        }, {
          migrationFile: "new/*createPerson",
          config:        { migrationStorageTableName: "sequelize_meta" }
        });
      });
    });
  });
});
