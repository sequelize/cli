'use strict';

const exec    = require('child_process').exec;
const support = require('./index');
const through = require('through2');
const expect  = require('expect.js');
const path    = require('path');
const fs      = require('fs-extra');

module.exports = {
  getTestConfig(mixin) {
    const dialect = support.getTestDialect();
    let config  = require(support.resolveSupportPath('config', 'config.js'));

    config.sqlite.storage = support.resolveSupportPath('tmp', 'test.sqlite');
    config = Object.assign(
      config,
      config[dialect],
      mixin || {},
      { dialect }
    );

    return config;
  },

  getTestUrl() {
    return support.getTestUrl(this.getTestConfig());
  },

  clearDirectory() {
    return through.obj((file, encoding, callback) => {
      exec('rm -rf ./* && rm -f ./.sequelizerc', { cwd: file.path }, err => {
        callback(err, file);
      });
    });
  },

  removeFile(filePath) {
    return through.obj((file, encoding, callback) => {
      exec(`rm ${filePath}`, { cwd: file.path }, err => {
        callback(err, file);
      });
    });
  },

  runCli(args, options) {
    options = options || {};

    return through.obj((file, encoding, callback) => {
      const command = support.getCliCommand(file.path, args);
      const env     = Object.assign({}, process.env, options.env);

      logToFile(command);

      exec(command, { cwd: file.path, env }, (err, stdout, stderr) => {
        let result = file;

        logToFile({ err, stdout, stderr });

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
            callback(new Error('Expected cli to exit with a non-zero code'), null);
          }
        } else {
          err = options.pipeStderr ? null : err;
          callback(err, result);
        }
      });
    });
  },

  copyFile(from, to) {
    return through.obj((file, encoding, callback) => {
      fs.copy(from, path.resolve(file.path, to), err => {
        callback(err, file);
      });
    });
  },

  listFiles(subPath) {
    return through.obj((file, encoding, callback) => {
      const cwd = path.resolve(file.path, subPath || '');

      exec('ls -ila', { cwd }, callback);
    });
  },

  expect(fun) {
    return through.obj((stdout, encoding, callback) => {
      try {
        fun(stdout);
        callback(null, stdout);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
        callback(e, null);
      }
    });
  },

  ensureContent(needle) {
    return this.expect(stdout => {
      if (needle instanceof RegExp) {
        expect(stdout).to.match(needle);
      } else {
        expect(stdout).to.contain(needle);
      }
    });
  },

  overwriteFile(content, pathToFile) {
    return through.obj((file, encoding, callback) => {
      const filePath = path.join(file.path, pathToFile);

      fs.writeFile(filePath, content, err => {
        callback(err, file);
      });
    });
  },

  readFile(pathToFile) {
    return through.obj((file, encoding, callback) => {
      exec(`cat ${pathToFile}`, { cwd: file.path }, callback);
    });
  },

  copyMigration(fileName, migrationsFolder) {
    migrationsFolder = migrationsFolder || 'migrations';

    return through.obj((file, encoding, callback) => {
      const migrationSource = support.resolveSupportPath('assets', 'migrations');
      const migrationTarget = path.resolve(file.path, migrationsFolder);

      exec(`cp ${migrationSource}/*${fileName  } ${migrationTarget}/`, err => {
        callback(err, file);
      });
    });
  },

  copySeeder(fileName, seedersFolder) {
    seedersFolder = seedersFolder || 'seeders';

    return through.obj((file, encoding, callback) => {
      const seederSource = support.resolveSupportPath('assets', 'seeders');
      const seederTarget = path.resolve(file.path, seedersFolder);

      exec(`cp ${seederSource}/*${fileName  } ${seederTarget}/${fileName}`,
        err => {
          callback(err, file);
        }
      );
    });
  },

  teardown(done) {
    return through.obj((smth, encoding, callback) => {
      callback();
      done(null, smth);
    });
  },

  readTables(sequelize, callback) {
    return sequelize
      .getQueryInterface()
      .showAllTables()
      .then(tables => {
        return callback(tables.sort());
      });
  },

  readSchemas(sequelize, callback) {
    return sequelize
      .showAllSchemas()
      .then(schemas => {
        return callback(schemas.sort());
      });
  },

  countTable(sequelize, table, callback) {
    const QueryGenerator =  sequelize.getQueryInterface().QueryGenerator;

    return sequelize
      .query(`SELECT count(*) as count FROM ${QueryGenerator.quoteTable(table)}`)
      .then(result => {
        return callback(result.length === 2 ? result[0] : result );
      });
  },
  execQuery(sequelize, sql, options) {
    if (sequelize.query.length === 2) {
      return sequelize.query(sql, options);
    }
    return sequelize.query(sql, null, options);

  }
};

function logToFile(thing) {
  const text = typeof thing === 'string' ? thing : JSON.stringify(thing);
  const logPath = '../../logs';
  const logFile = `${logPath}/test.log`;

  fs.mkdirpSync(logPath);
  fs.appendFileSync(logFile, `[${new Date()  }] ${text  }\n`);
}
