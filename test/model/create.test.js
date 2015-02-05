"use strict";

var expect    = require("expect.js");
var Support   = require(__dirname + "/../support");
var helpers   = require(__dirname + "/../support/helpers");
var gulp      = require("gulp");
var _         = require("lodash");

([
  "model:create",
  "model:generate"
]).forEach(function(flag) {
  describe(Support.getTestDialectTeaser(flag), function() {
    var combineFlags = function(flags) {
      var result = flag;

      _.forEach(flags || {}, function(value, key) {
        result = result + " --" + key + " " + value;
      });

      return result;
    };

    var prepare = function(options, callback) {
      options = _.assign({
        flags: {},
        cli:   { pipeStdout: true }
      }, options || {});

      gulp
        .src(Support.resolveSupportPath("tmp"))
        .pipe(helpers.clearDirectory())
        .pipe(helpers.runCli("init"))
        .pipe(helpers.runCli(combineFlags(options.flags), options.cli))
        .pipe(helpers.teardown(callback));
    };

    describe("name", function() {
      describe("when missing", function() {
        it("exits with an error code", function(done) {
          prepare({
            flags: { attributes: "first_name:string" },
            cli: { exitCode: 1 }
          }, done);
        });

        it("notifies the user about a missing name flag", function(done) {
          prepare({
            flags: { attributes: "first_name:string" },
            cli: { pipeStderr: true }
          }, function(err, stdout) {
            expect(stdout).to.match(/Unspecified flag.*name/);
            done();
          });
        });
      });
    });

    describe("attributes", function() {
      describe("when missing", function() {
        it("exits with an error code", function(done) {
          prepare({
            flags: { name: "User" },
            cli: { exitCode: 1 }
          }, done);
        });

        it("notifies the user about a missing attributes flag", function(done) {
          prepare({
            flags: { name: "User" },
            cli: { pipeStderr: true }
          }, function(err, stdout) {
            expect(stdout).to.match(/Unspecified flag.*attributes/);
            done();
          });
        });
      });

      ;([
        "first_name:string,last_name:string,bio:text",
        "\"first_name:string last_name:string bio:text\"",
        "\"first_name:string, last_name:string, bio:text\""
      ]).forEach(function(attributes) {
        describe("--attributes " + attributes, function() {
          it("exits with exit code 0", function(done) {
            prepare({
              flags: { name: "User", attributes: attributes },
              cli: { exitCode: 0 }
            }, done);
          });

          it("creates the model file", function(done) {
            prepare({
              flags: { name: "User", attributes: attributes }
            }, function() {
              gulp
                .src(Support.resolveSupportPath("tmp", "models"))
                .pipe(helpers.listFiles())
                .pipe(helpers.ensureContent("user.js"))
                .pipe(helpers.teardown(done));
            });
          });

          it("generates the model attributes correctly", function(done) {
            prepare({
              flags: { name: "User", attributes: attributes }
            }, function() {
              gulp
                .src(Support.resolveSupportPath("tmp", "models"))
                .pipe(helpers.readFile("user.js"))
                .pipe(helpers.ensureContent("sequelize.define(\"User\""))
                .pipe(helpers.ensureContent("first_name: DataTypes.STRING"))
                .pipe(helpers.ensureContent("last_name: DataTypes.STRING"))
                .pipe(helpers.ensureContent("bio: DataTypes.TEXT"))
                .pipe(helpers.teardown(done));
            });
          });

          it("creates the migration file", function(done) {
            prepare({
              flags: { name: "User", attributes: attributes }
            }, function() {
              gulp
                .src(Support.resolveSupportPath("tmp", "migrations"))
                .pipe(helpers.listFiles())
                .pipe(helpers.ensureContent(/\d+-create-user.js/))
                .pipe(helpers.teardown(done));
            });
          });

          it("generates the migration content correctly", function(done) {
            prepare({
              flags: { name: "User", attributes: attributes }
            }, function() {
              gulp
                .src(Support.resolveSupportPath("tmp", "migrations"))
                .pipe(helpers.readFile("*-create-user.js"))
                .pipe(helpers.ensureContent("migration"))
                .pipe(helpers.ensureContent(".createTable(\"Users\", {"))
                .pipe(helpers.ensureContent(
                  "first_name: {\n        type: DataTypes.STRING\n      },"
                ))
                .pipe(helpers.ensureContent(
                  "last_name: {\n        type: DataTypes.STRING\n      },"
                ))
                .pipe(helpers.ensureContent(
                  "bio: {\n        type: DataTypes.TEXT\n      },"
                ))
                .pipe(helpers.ensureContent([
                  "     id: {",
                  "        allowNull: false,",
                  "        autoIncrement: true,",
                  "        primaryKey: true,",
                  "        type: DataTypes.INTEGER",
                  "      },"
                ].join("\n")))
                .pipe(helpers.ensureContent([
                  "     createdAt: {",
                  "        allowNull: false,",
                  "        type: DataTypes.DATE",
                  "      },"
                ].join("\n")))
                .pipe(helpers.ensureContent([
                  "     updatedAt: {",
                  "        allowNull: false,",
                  "        type: DataTypes.DATE",
                  "      }"
                ].join("\n")))
                .pipe(helpers.ensureContent("})"))
                .pipe(helpers.ensureContent(".done(done)"))
                .pipe(helpers.ensureContent(".dropTable(\"Users\")"))
                .pipe(helpers.teardown(done));
            });
          });

          describe("when called twice", function() {
            beforeEach(function(done) {
              this.flags = { name: "User", attributes: attributes };
              prepare({ flags: this.flags }, done);
            });

            it("exits with an error code", function(done) {
              gulp
                .src(Support.resolveSupportPath("tmp"))
                .pipe(helpers.runCli(combineFlags(this.flags), { exitCode: 1 }))
                .pipe(helpers.teardown(done));
            });

            it("notifies the user about the possibility of --flags", function(done) {
              gulp
                .src(Support.resolveSupportPath("tmp"))
                .pipe(helpers.runCli(combineFlags(this.flags), { pipeStderr: true }))
                .pipe(helpers.teardown(function(err, stderr) {
                  expect(stderr).to.contain("already exists");
                  done();
                }));
            });
          });
        });
      });
    });
  });
});
