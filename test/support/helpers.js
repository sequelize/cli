"use strict";

var exec    = require("child_process").exec;
var support = require("./index");
var through = require("through2");
var expect  = require("expect.js");
var path    = require("path");
var fs      = require("fs-extra");

module.exports = {
  getTestConfig: function(mixin) {
    var dialect = support.getTestDialect();
    var config  = require(support.resolveSupportPath("config", "config.js"));

    config.sqlite.storage = support.resolveSupportPath("tmp", "test.sqlite");
    config = support.Sequelize.Utils._.extend(
      config,
      config[dialect],
      mixin || {},
      { dialect: dialect }
    );

    return config;
  },

  getTestUrl: function() {
    return support.getTestUrl(this.getTestConfig());
  },

  clearDirectory: function() {
    return through.obj(function(file, encoding, callback) {
      exec("rm -rf ./*", { cwd: file.path }, function(err) {
        if (err) {
          callback(err, file);
        } else {
          exec("rm -f ./.sequelizerc", { cwd: file.path }, function(err) {
            callback(err, file);
          });
        }
      });
  	});
  },

  removeFile: function(filePath) {
    return through.obj(function(file, encoding, callback) {
      exec("rm " + filePath, { cwd: file.path }, function(err) {
        callback(err, file);
      });
    });
  },

  runCli: function(args, options) {
    options = options || {};

    return through.obj(function(file, encoding, callback) {
      var command = support.getCliCommand(file.path, args);

      exec(command, { cwd: file.path }, function(err, stdout, stderr) {
        var result = file;

        if (stdout) {
          expect(stdout).to.not.contain("EventEmitter");
        }

        if (options.pipeStdout) {
          result = stdout;
        } else if (options.pipeStderr) {
          result = stderr;
        }

        if (options.exitCode) {
          try {
            expect(err).to.be.ok();
            expect(err.code).to.equal(1);
            callback(null, result);
          } catch(e) {
            callback(e, result);
          }
        } else {
          err = options.pipeStderr ? null : err;
          callback(err, result);
        }
      });
    });
  },

  copyFile: function(from, to) {
    return through.obj(function (file, encoding, callback) {
      fs.copy(from, path.resolve(file.path, to), function (err) {
        callback(err, file);
      });
    });
  },

  listFiles: function(subPath) {
    return through.obj(function(file, encoding, callback) {
      var cwd = path.resolve(file.path, subPath || "");
      exec("ls -ila", { cwd: cwd }, callback);
    });
  },

  expect: function(fun) {
    return through.obj(function(stdout, encoding, callback) {
      try {
        fun(stdout);
        callback(null, stdout);
      } catch (e) {
        console.log(e);
        callback(e, null);
      }
    });
  },

  ensureContent: function(needle) {
    return this.expect(function(stdout) {
      if (needle instanceof RegExp) {
        expect(stdout).to.match(needle);
      } else {
        expect(stdout).to.contain(needle);
      }
    });
  },

  overwriteFile: function(content, pathToFile) {
    return through.obj(function(file, encoding, callback) {
      exec("echo '" + content + "' > " + pathToFile, { cwd: file.path }, function(err) {
        callback(err, file);
      });
    });
  },

  readFile: function(pathToFile) {
    return through.obj(function(file, encoding, callback) {
      exec("cat " + pathToFile, { cwd: file.path }, callback);
    });
  },

  copyMigration: function(fileName, migrationsFolder) {
    migrationsFolder = migrationsFolder || "migrations";

    return through.obj(function(file, encoding, callback) {
      var migrationSource = support.resolveSupportPath("assets", "migrations");
      var migrationTarget = path.resolve(file.path, migrationsFolder);

      exec("cp " + migrationSource + "/*" + fileName + " " + migrationTarget + "/", function(err) {
        callback(err, file);
      });
    });
  },

  teardown: function(done) {
    return through.obj(function(smth, encoding, callback) {
      callback();
      done(null, smth);
    });
  },

  readTables: function(sequelize, callback) {
    sequelize
      .getQueryInterface()
      .showAllTables()
      .then(function(tables) {
        callback(tables.sort());
      });
  }
};
