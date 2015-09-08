'use strict';

var _       = require('lodash');
var exec    = require('child_process').exec;
var support = require('./index');
var through = require('through2');
var expect  = require('expect.js');
var path    = require('path');
var fs      = require('fs-extra');

module.exports = {
  getTestConfig: function (mixin) {
    var dialect = support.getTestDialect();
    var config  = require(support.resolveSupportPath('config', 'config.js'));

    config.sqlite.storage = support.resolveSupportPath('tmp', 'test.sqlite');
    config = support.Sequelize.Utils._.extend(
      config,
      config[dialect],
      mixin || {},
      { dialect: dialect }
    );

    return config;
  },

  getTestUrl: function () {
    return support.getTestUrl(this.getTestConfig());
  },

  clearDirectory: function () {
    return through.obj(function (file, encoding, callback) {
      exec('rm -rf ./*', { cwd: file.path }, function (err) {
        if (err) {
          callback(err, file);
        } else {
          exec('rm -f ./.sequelizerc', { cwd: file.path }, function (err) {
            callback(err, file);
          });
        }
      });
    });
  },

  removeFile: function (filePath) {
    return through.obj(function (file, encoding, callback) {
      exec('rm ' + filePath, { cwd: file.path }, function (err) {
        callback(err, file);
      });
    });
  },

  runCli: function (args, options) {
    options = options || {};

    return through.obj(function (file, encoding, callback) {
      var command = support.getCliCommand(file.path, args);
      var env     = _.extend({}, process.env, options.env);

      logToFile(command);

      exec(command, { cwd: file.path, env: env }, function (err, stdout, stderr) {
        var result = file;

        logToFile({err: err, stdout: stdout, stderr: stderr});

        if (stdout) {
          expect(stdout).to.not.contain('EventEmitter');
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
          } catch (e) {
            callback(e, result);
          }
        } else {
          err = options.pipeStderr ? null : err;
          callback(err, result);
        }
      });
    });
  },

  copyFile: function (from, to) {
    return through.obj(function (file, encoding, callback) {
      fs.copy(from, path.resolve(file.path, to), function (err) {
        callback(err, file);
      });
    });
  },

  listFiles: function (subPath) {
    return through.obj(function (file, encoding, callback) {
      var cwd = path.resolve(file.path, subPath || '');

      exec('ls -ila', { cwd: cwd }, callback);
    });
  },

  expect: function (fun) {
    return through.obj(function (stdout, encoding, callback) {
      try {
        fun(stdout);
        callback(null, stdout);
      } catch (e) {
        console.log(e);
        callback(e, null);
      }
    });
  },

  ensureContent: function (needle) {
    return this.expect(function (stdout) {
      if (needle instanceof RegExp) {
        expect(stdout).to.match(needle);
      } else {
        expect(stdout).to.contain(needle);
      }
    });
  },

  overwriteFile: function (content, pathToFile) {
    return through.obj(function (file, encoding, callback) {
      var filePath = path.join(file.path, pathToFile);

      fs.writeFile(filePath, content, function (err) {
        callback(err, file);
      });
    });
  },

  readFile: function (pathToFile) {
    return through.obj(function (file, encoding, callback) {
      exec('cat ' + pathToFile, { cwd: file.path }, callback);
    });
  },

  copyMigration: function (fileName, migrationsFolder) {
    migrationsFolder = migrationsFolder || 'migrations';

    return through.obj(function (file, encoding, callback) {
      var migrationSource = support.resolveSupportPath('assets', 'migrations');
      var migrationTarget = path.resolve(file.path, migrationsFolder);

      exec('cp ' + migrationSource + '/*' + fileName + ' ' + migrationTarget + '/', function (err) {
        callback(err, file);
      });
    });
  },

  copySeeder: function (fileName, seedersFolder) {
    seedersFolder = seedersFolder || 'seeders';

    return through.obj(function (file, encoding, callback) {
      var seederSource = support.resolveSupportPath('assets', 'seeders');
      var seederTarget = path.resolve(file.path, seedersFolder);

      exec('cp ' + seederSource + '/*' + fileName + ' ' + seederTarget + '/', function (err) {
        callback(err, file);
      });
    });
  },

  teardown: function (done) {
    return through.obj(function (smth, encoding, callback) {
      callback();
      done(null, smth);
    });
  },

  readTables: function (sequelize, callback) {
    sequelize
      .getQueryInterface()
      .showAllTables()
      .then(function (tables) {
        callback(tables.sort());
      });
  },

  countTable: function (sequelize, table, callback) {
    var QueryGenerator =  sequelize.getQueryInterface().QueryGenerator;

    sequelize
      .query('SELECT count(*) as count FROM ' + QueryGenerator.quoteTable(table))
      .then(function (result) {
        callback((result.length === 2) ? result[0] : result );
      });
  }
};

function logToFile (thing) {
  var text = (typeof thing === 'string') ? thing : JSON.stringify(thing);
  var logPath = __dirname + '/../../logs';
  var logFile = logPath + '/test.log';

  fs.mkdirpSync(logPath);
  fs.appendFileSync(logFile, '[' + new Date() + '] ' + text + '\n');
}
