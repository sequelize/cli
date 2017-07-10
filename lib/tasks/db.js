'use strict';

var Bluebird  = require('bluebird');
var fs        = require('fs');
var path      = require('path');
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
          console.error('Seed file failed with error:', err.message, err.stack);
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
          console.error('Seed file failed with error:', err.message, err.stack);
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
        return (
          helpers.umzug.getStorage('seeder') === 'none' ? migrator.pending() : migrator.executed()
        )
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
          console.error('Seed file failed with error:', err.message, err.stack);
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
          console.error('Seed file failed with error:', err.message, err.stack);
          process.exit(1);
        });
      });
    }
  },

  'db:migrate:status': {
    descriptions: {
      'short': 'List the status of all migrations'
    },

    task: function () {
      return getMigrator('migration').then(function (migrator) {
        return ensureCurrentMetaSchema(migrator).then(function () {
          return migrator.executed();
        }).then(function (migrations) {
          _.forEach(migrations, function (migration) {
            console.log('up  ', migration.file);
          });
        }).then(function () {
          return migrator.pending();
        }).then(function (migrations) {
          _.forEach(migrations, function (migration) {
            console.log('down', migration.file);
          });
        }).then(function () {
          process.exit(0);
        }).catch(function (err) {
          console.error(err);
          process.exit(1);
        });
      });
    }
  },

  'db:migrate:undo': {
    descriptions: {
      'short': 'Reverts a migration.',
      options: {
        '--name': 'Name of the migration to undo.'
      }
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
          if (args.name) {
            return migrator.down(args.name);
          } else {
            return migrator.down();
          }
        }).then(function () {
          process.exit(0);
        }).catch(function (err) {
          console.error(err);
          process.exit(1);
        });
      });
    }
  },

  'db:migrate:undo:all': {
    descriptions: {
      'short': 'Revert all migrations ran.',
      options: {
        '--to': 'Revert to the provided migration. Default is 0.'
      }
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
          var to = args.to || 0;
          return migrator.down({to: to});
        }).then(function () {
          process.exit(0);
        }).catch(function (err) {
          console.error(err);
          process.exit(1);
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
      return getMigrator('migration')
      .then(function (migrator) {
        return tryToMigrateFromOldSchema(migrator)
        .then(function (items) {
          if (items) {
            console.log('Successfully migrated ' + items.length + ' migrations.');
          }

          process.exit(0);
        }, function (err) {
          console.error(err);
          process.exit(1);
        });
      });
    }
  },

  'db:migrate:schema:timestamps:add': {
    descriptions: {
      'short': 'Update migration table to have timestamps',
      'long': [
        'This command updates the structure of the SequelizeMeta table to include',
        '"createdAt" and "updatedAt" columns. This is an optional definition and',
        'not required to keep on working with sequelize-cli.',
        '',
        'Please note that the script will create a backup of your old table schema',
        'table by renaming the original table to "<tableName>Backup".'
      ]
    },

    task: function () {
      return getMigrator('migration')
      .then(function (migrator) {
        return addTimestampsToSchema(migrator)
        .then(function (items) {
          if (items) {
            console.log('Successfully added timestamps to MetaTable.');
          } else {
            console.log('MetaTable already has timestamps.');
          }

          process.exit(0);
        }, function (err) {
          console.error(err);
          process.exit(1);
        });
      });
    }
  }
};

function ensureCurrentMetaSchema (migrator) {
  var queryInterface  = migrator.options.storageOptions.sequelize.getQueryInterface();
  var tableName  = migrator.options.storageOptions.tableName;
  var columnName = migrator.options.storageOptions.columnName;
  var config = helpers.config.readConfig();

  return ensureMetaTable(queryInterface, tableName)
  .then(function (table) {
    var columns = Object.keys(table);

    if ((columns.length === 1) && (columns[0] === columnName)) {
      return;
    } else if (columns.length === 3 && columns.indexOf('createdAt') >= 0) {
      return;
    } else {
      if (!config.autoMigrateOldSchema) {
        console.error(
          'Database schema was not migrated. Please run ' +
          '"sequelize db:migrate:old_schema" first.'
        );
        process.exit(1);
      }

      return tryToMigrateFromOldSchema(migrator);
    }
  },
  function () {
    return;
  });
}

function logMigrator (s) {
  if (s.indexOf('Executing') !== 0) {
    helpers.view.log(s);
  }
}

function ensureMetaTable (queryInterface, tableName) {
  return queryInterface.showAllTables()
  .then(function (tableNames) {
    if (tableNames.indexOf(tableName) === -1) {
      throw new Error('No MetaTable table found.');
    }
  })
  .then(function () {
    return queryInterface.describeTable(tableName);
  });
}

function getSequelizeInstance () {
  var config  = null;

  try {
    config = helpers.config.readConfig();
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }

  config = _.defaults(config, { logging: logMigrator });

  try {
    return new Sequelize(config);
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
function tryToMigrateFromOldSchema (migrator) {
  var sequelize      = migrator.options.storageOptions.sequelize;
  var queryInterface = sequelize.getQueryInterface();

  return ensureMetaTable(queryInterface, 'SequelizeMeta')
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
 * Add timestamps
 *
 * @return {Promise}
 */
function addTimestampsToSchema (migrator) {
  var sequelize      = migrator.options.storageOptions.sequelize;
  var queryInterface = sequelize.getQueryInterface();
  var tableName      = migrator.options.storageOptions.tableName;

  return ensureMetaTable(queryInterface, tableName)
  .then(function (table) {
    if (table.createdAt) {
      return;
    }

    return ensureCurrentMetaSchema(migrator)
    .then(function () {
      return queryInterface.renameTable(tableName, tableName + 'Backup');
    })
    .then(function () {
      var sql = queryInterface.QueryGenerator.selectQuery(tableName + 'Backup');

      return helpers.generic.execQuery(sequelize, sql, { type: 'SELECT', raw: true });
    })
    .then(function (result) {
      var SequelizeMeta = sequelize.define(tableName, {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          primaryKey: true,
          autoIncrement: false
        }
      }, {
        tableName:  tableName,
        timestamps: true
      });

      return SequelizeMeta.sync()
      .then(function () {
        return SequelizeMeta.bulkCreate(result);
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
