"use strict";

var expect  = require("expect.js");
var Support = require(__dirname + "/../../support");
var helpers = require(__dirname + "/../../support/helpers");
var gulp    = require("gulp");

([
  "db:migrate:old_schema"
  ]).forEach(function(flag) {
    var prepare = function(callback) {
      gulp
      .src(Support.resolveSupportPath("tmp"))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli("init"))
      .pipe(helpers.copyMigration("createPerson.js"))
      .pipe(helpers.copyMigration("emptyMigration.js"))
      .pipe(helpers.copyMigration("renamePersonToUser.js"))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), "config/config.json"))
      .pipe(helpers.teardown(callback));
    };

    describe(Support.getTestDialectTeaser(flag), function() {
      beforeEach(function (done) {
        var self = this;

        prepare(function () {
          var SequelizeMeta = self.sequelize.define("SequelizeMeta",
            { from: Support.Sequelize.STRING, to: Support.Sequelize.STRING },
            { timestamps: false }
          );

          SequelizeMeta.sync({ force: true }).then(function () {
            return SequelizeMeta.bulkCreate([
              { from: "20111117063700", to: "20111117063700" },
              { from: "20111117063700", to: "20111205064000" }
            ]);
          }).then(function () {
            gulp
            .src(Support.resolveSupportPath("tmp"))
            .pipe(helpers.runCli(flag))
            .pipe(helpers.teardown(done));
          });
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
          null, { raw: true }
        ).then(function (items) {
          expect(items).to.eql([
            { name: "20111117063700-createPerson" },
            { name: "20111205064000-renamePersonToUser" }
          ]);
          done();
        });
      });
    });
  });
