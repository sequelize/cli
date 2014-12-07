  "use strict";

var expect  = require("expect.js");
var Support = require(__dirname + "/../../support");
var helpers = require(__dirname + "/../../support/helpers");
var gulp    = require("gulp");

([
  "db:migrate:undo"
]).forEach(function(flag) {
  var prepare = function(callback, _flag) {
    _flag = _flag || flag;

    gulp
      .src(Support.resolveSupportPath("tmp"))
      .pipe(helpers.clearDirectory())
      .pipe(helpers.runCli("init"))
      .pipe(helpers.copyMigration("createPerson.js"))
      .pipe(helpers.overwriteFile(JSON.stringify(helpers.getTestConfig()), "config/config.json"))
      .pipe(helpers.runCli(_flag, { pipeStdout: true }))
      .pipe(helpers.teardown(callback));
  };

  describe(Support.getTestDialectTeaser(flag), function() {
    it("creates a SequelizeMeta table", function(done) {
      var self = this;

      prepare(function() {
        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(1);
          expect(tables[0]).to.equal("SequelizeMeta");
          done();
        });
      });
    });

    it("stops execution if no migrations have been done yet", function(done) {
      prepare(function(err, output) {
        expect(err).to.equal(null);
        expect(output).to.contain("No executed migrations found.");
        done();
      }.bind(this));
    });

    it("is correctly undoing a migration if they have been done already", function(done) {
      var self = this;

      prepare(function() {
        helpers.readTables(self.sequelize, function(tables) {
          expect(tables).to.have.length(2);
          expect(tables[0]).to.equal("Person");

          gulp
            .src(Support.resolveSupportPath("tmp"))
            .pipe(helpers.runCli(flag, { pipeStdout: true }))
            .pipe(helpers.teardown(function() {
              helpers.readTables(self.sequelize, function(tables) {
                expect(tables).to.have.length(1);
                expect(tables[0]).to.equal("SequelizeMeta");
                done();
              });
            }));
        });
      }, "db:migrate");
    });
  });
});
