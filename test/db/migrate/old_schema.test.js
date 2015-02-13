"use strict";

var expect  = require("expect.js");
var Support = require(__dirname + "/../../support");
var helpers = require(__dirname + "/../../support/helpers");
var gulp    = require("gulp");
var Bluebird = require("bluebird");

([
  "db:migrate:old_schema"
  ]).forEach(function(flag) {
    var prepare = function(config, callback) {
      config = helpers.getTestConfig(config);

      gulp
      .src(Support.resolveSupportPath("tmp"))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli("init"))
      .pipe(helpers.copyMigration("createPerson.js"))
      .pipe(helpers.copyMigration("emptyMigration.js"))
      .pipe(helpers.copyMigration("renamePersonToUser.js"))
      .pipe(helpers.overwriteFile(JSON.stringify(config), "config/config.json"))
      .pipe(helpers.teardown(callback));
    };

    var prepareLegacyScenario = function (config, callback) {
      var self = this;

      prepare(config, function () {
        var SequelizeMeta = self.sequelize.define("SequelizeMeta",
        { from: Support.Sequelize.STRING, to: Support.Sequelize.STRING },
        { timestamps: false }
      );

      SequelizeMeta.sync({ force: true }).then(function () {
        return SequelizeMeta.bulkCreate([
          { from: "20111117063700", to: "20111117063700" },
          { from: "20111117063700", to: "20111205064000" }
          ]);
        }).then(callback);
      });
    };

    describe(Support.getTestDialectTeaser(flag + " meta schema"), function () {
      beforeEach(function (done) {
        return prepareLegacyScenario.call(this, null, function () { done(); });
      });

      it("is enforced", function (done) {
        gulp
        .src(Support.resolveSupportPath("tmp"))
        .pipe(helpers.runCli("db:migrate", { pipeStderr: true }))
        .pipe(helpers.teardown(function (err, stderr) {
          expect(stderr).to.contain("Please run 'sequelize db:migrate:old_schema' first.");
          done();
        }));
      });
    });

    describe(Support.getTestDialectTeaser(flag + " auto migrate old schema"), function () {
      beforeEach(function (done) {
        return prepareLegacyScenario.call(this, {
          autoMigrateOldSchema: true
        }, function () { done(); });
      });

      it("shouldn't enforce if we provide autoMigrateOldSchema option", function () {

        return Bluebird.cast().bind(this)

        .then(function () {
            return this.sequelize.getQueryInterface().describeTable("SequelizeMeta");
        })
        .then(function (fields) {
          expect(Object.keys(fields)).to.eql(["id","from", "to"]);
        })

        .then(function () {
            return new Bluebird(function(fulfill, reject) {
                gulp
                .src(Support.resolveSupportPath("tmp"))
                .pipe(helpers.runCli("db:migrate", { pipeStderr: true }))
                .pipe(helpers.teardown(function (err, stderr) {
                  if( err || stderr ) {
                    reject( err || stderr );
                    return;
                  }

                  fulfill();
                }));
            });
        })

        .then(function () {
            return this.sequelize.getQueryInterface().describeTable("SequelizeMeta");
        })
        .then(function (fields) {
          expect(Object.keys(fields)).to.eql(["name"]);
        });

      });
    });

    describe(Support.getTestDialectTeaser(flag), function() {
      beforeEach(function (done) {
        prepareLegacyScenario.call(this, null, function () {
          gulp
            .src(Support.resolveSupportPath("tmp"))
            .pipe(helpers.runCli(flag))
            .pipe(helpers.teardown(done));
        });
      });

      it("renames the original table", function(done) {
        var self = this;

        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(2);
          expect(tables[0]).to.equal("SequelizeMeta");
          expect(tables[1]).to.equal("SequelizeMetaBackup");
          done();
        });
      });

      it("keeps the data in the original table", function (done) {
        this.sequelize.query(
          this.sequelize.getQueryInterface().QueryGenerator.selectQuery("SequelizeMetaBackup"),
          null, { raw: true }
        ).then(function (items) {
          expect(items.length).to.equal(2);
          done();
        });
      });

      it("keeps the structure of the original table", function (done) {
        var self = this;

        helpers.readTables(self.sequelize, function() {
          self
            .sequelize
            .getQueryInterface()
            .describeTable("SequelizeMetaBackup")
            .then(function (fields) {
              expect(Object.keys(fields).sort()).to.eql(["from", "id", "to"]);
              done();
            });
        });
      });

      it("creates a new SequelizeMeta table with the new structure", function (done) {
        this.sequelize.getQueryInterface().describeTable("SequelizeMeta").then(function (fields) {
          expect(Object.keys(fields)).to.eql(["name"]);
          done();
        });
      });

      it("creates two entries in the new table", function (done) {
        this.sequelize.query(
          this.sequelize.getQueryInterface().QueryGenerator.selectQuery("SequelizeMeta"),
          null, { raw: true, type: "SELECT" }
        ).then(function (items) {
          expect(items).to.eql([
            { name: "20111117063700-createPerson.js" },
            { name: "20111205064000-renamePersonToUser.js" }
          ]);
          done();
        });
      });

      it("is possible to undo one of the already executed migrations", function (done) {
        var self = this;

        // We are creating the User table here because the migrator will rename it to Person
        // afterwards.
        this.sequelize.define(
          "User",
          { name: Support.Sequelize.STRING },
          { tableName: "User" }
        ).sync({ force: true })
        .then(function () {
          gulp
          .src(Support.resolveSupportPath("tmp"))
          .pipe(helpers.runCli("db:migrate:undo"))
          .pipe(helpers.teardown(function () {
            self.sequelize.query(
              self.sequelize.getQueryInterface().QueryGenerator.selectQuery("SequelizeMeta"),
              null, { raw: true, type: "SELECT" }
            ).then(function (items) {
              expect(items).to.eql([
                { name: "20111117063700-createPerson.js" }
              ]);
              done();
            });
          }));
        });
      });
    });
  });
