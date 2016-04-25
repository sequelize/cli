'use strict';

var Bluebird  = require('bluebird');
var fs        = require('fs');
var path      = require('path');
var url       = require('url');
var helpers   = require(path.resolve(__dirname, '..', 'helpers'));
var args      = require('yargs').string('seed').argv;
var _         = require('lodash');
var Sequelize = helpers.generic.getSequelize();
var Umzug     = require('umzug');
var clc       = require('cli-color');

module.exports = {
  'db:migrate': {
    descriptions: {
      'short': 'Run pending migrations.',
      'long': [
        'The command runs every not yet executed migration.'
      ]
    },

    task: function () {
      return getMigrator('migration').then(function (migrator) {
        return ensureCurrentMetaSchema(migrator).then(function () {
          return migrator.pending();
        }).then(function (migrations) {
          if (migrations.length === 0) {
            console.log('No migrations were executed, database schema was already up to date.');
            process.exit(0);
          }
        }).then(function () {
          return migrator.up();
        }).then(function () {
          process.exit(0);
        }).catch(function (err) {
          console.error(err);
          process.exit(1);
        });
      });
    }
  },

  'db:seed': {
    descriptions: {
      'short': 'Run specified seeder.',
      'long': [
        'The command runs every existing seed file.'
      ],
      options: {
        '--seed': 'List of seed files to run.'
      }
    },

    preChecks: [
      ensureSeeds
    ],

    task: function () {
      this.preChecks.forEach(function (preCheck) {
        preCheck();
      });

      return getMigrator('seeder').then(function (migrator) {
        return migrator.up(args.seed)
        .then(function () {
          process.exit(0);
        })
        .catch(function (err) {
          console.error('Seed file failed with error:', err.message);
          process.exit(1);
        });
      });
    }
  },

  'db:seed:all': {
    descriptions: {
      'short': 'Run every seeder.',
      'long': [
        'The command runs every existing seed file in alphabetical order.'
      ]
    },

    task: function () {
      return getMigrator('seeder').then(function (migrator) {
        return migrator.pending()
        .then(function (seeders) {
          if (seeders.length === 0) {
            console.log('No seeders found.');
            process.exit(0);
          }

          return migrator.up({migrations: _.chain(seeders).map('file').value()});
        }).then(function () {
          process.exit(0);
        })
        .catch(function (err) {
          console.error('Seed file failed with error:', err.message);
          process.exit(1);
        });
      });
    }
  },

  'db:seed:undo:all': {
    descriptions: {
      'short': 'Deletes data from the database.',
      'long': [
        'The command tries unseeding every existing seed.'
      ]
    },

    task: function () {
      return getMigrator('seeder').then(function (migrator) {
        return migrator.pending()
        .then(function (seeders) {
          if (seeders.length === 0) {
            console.log('No seeders found.');
            process.exit(0);
          }

          return migrator.down({migrations: _.chain(seeders).map('file').reverse().value()});
        }).then(function () {
          process.exit(0);
        })
        .catch(function (err) {
          console.error('Seed file failed with error:', err.message);
          process.exit(1);
        });
      });
    }
  },

  'db:seed:undo': {
    descriptions: {
      'short': 'Deletes data from the database.',
      'long': [
        'The command unseeds every existing seed.'
      ],
      options: {
        '--seed': 'List of seed files to unseed.'
      }
    },

    preChecks: [
      ensureSeeds
    ],

    task: function () {
      this.preChecks.forEach(function (preCheck) {
        preCheck();
      });

      return getMigrator('seeder').then(function (migrator) {
        return migrator.down({migrations: args.seed})
        .then(function () {
          process.exit(0);
        })
        .catch(function (err) {
          console.error('Seed file failed with error:', err.message);
          process.exit(1);
        });
      });
    }
  },

  'db:migrate:undo': {
    descriptions: {
      'short': 'Revert the last migration run.'
    },

    task: function () {
      return getMigrator('migration').then(function (migrator) {
        return ensureCurrentMetaSchema(migrator).then(function () {
          return migrator.executed();
        }).then(function (migrations) {
          if (migrations.length === 0) {
            console.log('No executed migrations found.');
            process.exit(0);
          }
        }).then(function () {
          return migrator.down();
        }).then(function () {
          process.exit(0);
        });
      });
    }
  },

  'db:migrate:undo:all': {
    descriptions: {
      'short': 'Revert all migrations ran.'
    },

    task: function () {
      return getMigrator('migration').then(function (migrator) {
        return ensureCurrentMetaSchema(migrator).then(function () {
          return migrator.executed();
        }).then(function (migrations) {
          if (migrations.length === 0) {
            console.log('No executed migrations found.');
            process.exit(0);
          }
        }).then(function () {
          return migrator.down({to: 0});
        }).then(function () {
          process.exit(0);
        });
      });
    }
  },

  'db:migrate:old_schema': {
    descriptions: {
      'short': 'Update legacy migration table',
      'long': [
        'This command updates the legacy structure of the SequelizeMeta table to',
        'the newer version which is shipped with the migrator engine "umzug" and',
        'which is the required structure of the CLI since version 1.0.0.',
        '',
        'In details this means, that the previous structure (id:int, from:string,',
        'to:string) gets migrated to the new structure (name:string). As the old',
        'structure does not actually contain all single migration names but only',
        'certain ranges, the script will take a look at the migrations folder and',
        'generate the single migration names accordingly.',
        '',
        'Please note that the script will create a backup of your old table schema',
        'table by renaming the original table to SequelizeMetaBackup.'
      ]
    },

    task: function () {
      tryToMigrateFromOldSchema()
        .then(function (items) {
          if (items) {
            console.log('Successfully migrated ' + items.length + ' migrations.');
          }

          process.exit(0);
        }, function (err) {
          console.log(err.name);
          process.exit(1);
        });
    }
  }
};

function ensureCurrentMetaSchema (migrator) {
  var sequelize  = migrator.options.storageOptions.sequelize;
  var columnName = migrator.options.storageOptions.columnName;
  var config = helpers.config.readConfig();

  return sequelize.getQueryInterface()
    .showAllTables()
    .then(function (tables) {
      if (tables.indexOf('SequelizeMeta') === -1) {
        return;
      }

      return sequelize.queryInterface
        .describeTable('SequelizeMeta')
        .then(function (table) {
          var columns = Object.keys(table);

          if ((columns.length === 1) && (columns[0] === columnName)) {
            return;
          } else {
            if (!config.autoMigrateOldSchema) {
              console.error(
                'Database schema was not migrated. Please run ' +
                '"sequelize db:migrate:old_schema" first.'
              );
              process.exit(1);
            }

            return tryToMigrateFromOldSchema();
          }
        });
    });
}

function logMigrator (s) {
  if (s.indexOf('Executing') !== 0) {
    helpers.view.log(s);
  }
}

function getSequelizeInstance () {
  var config  = null;
  var options = {};

  try {
    config = helpers.config.readConfig();
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }

  _.forEach(config, function (value, key) {
    if (['database', 'username', 'password'].indexOf(key) === -1) {
      options[key] = value;
    }

    if (key === 'use_env_variable') {
      if (process.env[value]) {
        var dbUrl = url.parse(process.env[value]);
        var protocol = dbUrl.protocol.split(':')[0];

        config.database = dbUrl.pathname.substring(1);

        if (protocol === 'sqlite') {
          options.storage = dbUrl.pathname;
        } else if (dbUrl.auth) {
          var auth = dbUrl.auth.split(':');

          config.username = auth[0];
          config.password = auth[1];
        }

        options = _.assign(options, {
          host: dbUrl.hostname,
          port: dbUrl.port,
          dialect: protocol,
          protocol: protocol
        });
      }
    }

    if (key === 'dialectOptions') {
      options = _.assign(options, {
        dialectOptions: value
      });
    }
  });

  options = _.assign({ logging: logMigrator }, options);

  try {
    return new Sequelize(config.database, config.username, config.password, options);
  } catch (e) {
    console.warn(e);
    throw e;
  }
}

function getMigrator (type) {
  if (helpers.config.configFileExists() || args.url) {
    var sequelize = getSequelizeInstance();
    var migrator  = new Umzug({
      storage:        helpers.umzug.getStorage(type),
      storageOptions: helpers.umzug.getStorageOptions(type, { sequelize: sequelize }),
      logging:        console.log,
      migrations:     {
        params:  [ sequelize.getQueryInterface(), Sequelize ],
        path:    helpers.path.getPath(type),
        pattern: helpers.config.supportsCoffee() ? /\.js$|\.coffee$/ : /\.js$/,
        wrap:    function (fun) {
          if (fun.length === 3) {
            return Bluebird.promisify(fun);
          } else {
            return fun;
          }
        }
      }
    });

    return sequelize
    .authenticate()
    .then(function () {
      return migrator;
    })
    .catch(function (err) {
      console.error('Unable to connect to database: ' + err);
      process.exit(1);
    });
  } else {
    console.log(
      'Cannot find "' + helpers.config.getConfigFile() +
      '". Have you run "sequelize init"?'
    );
    process.exit(1);
  }
}

/**
 * tryToMigrateFromOldSchema - migrates from old schema
 *
 * @return {Promise}
 */
function tryToMigrateFromOldSchema () {
  var sequelize = getSequelizeInstance();
  var queryInterface = sequelize.getQueryInterface();

  return queryInterface.showAllTables()
  .then(function (tableNames) {
    if (tableNames.indexOf('SequelizeMeta') === -1) {
      throw new Error('No SequelizeMeta table found.');
    }
  })
  .then(function () {
    return queryInterface.describeTable('SequelizeMeta');
  })
  .then(function (table) {
    if (JSON.stringify(Object.keys(table).sort()) === JSON.stringify(['id', 'from', 'to'])) {
      return;
    }
    return queryInterface.renameTable('SequelizeMeta', 'SequelizeMetaBackup')
    .then(function () {
      var sql = queryInterface.QueryGenerator.selectQuery('SequelizeMetaBackup');

      return helpers.generic.execQuery(sequelize, sql, { type: 'SELECT', raw: true });
    })
    .then(function (result) {
      var timestamps = result.map(function (item) {
        return item.to;
      });
      var files      = fs.readdirSync(helpers.path.getPath('migration'));

      return files.filter(function (file) {
        var match = file.match(/(\d+)-?/);

        if (match) {
          var timestamp = match[0].replace('-', '');

          return timestamps.indexOf(timestamp) > -1;
        }
      });
    })
    .then(function (files) {
      var SequelizeMeta = sequelize.define('SequelizeMeta', {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          primaryKey: true,
          autoIncrement: false
        }
      }, {
        tableName:  'SequelizeMeta',
        timestamps: false
      });

      return SequelizeMeta.sync().then(function () {
        return SequelizeMeta.bulkCreate(
          files.map(function (file) {
            return { name: file };
          })
        );
      });
    });
  });
}

/**
 * ensureSeeds - checks that the `--seed` option exists
 */

function ensureSeeds () {
  if ( !args.seed ) {
    helpers.view.error(
      'Unspecified flag ' +
      clc.blueBright('"seed"') +
      '. Check the manual for further details.'
    );
    process.exit(1);
  }

  if ( !_.isArray(args.seed) ) {
    args.seed = [args.seed];
  }

  args.seed.forEach(function (file, ind) {
    args.seed[ind] = path.basename(file);
  });
}
