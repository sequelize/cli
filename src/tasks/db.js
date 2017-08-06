

const Bluebird  = require('bluebird');
const fs        = require('fs');
const path      = require('path');
const helpers   = require(path.resolve(__dirname, '..', 'helpers'));
const args      = require('yargs').string('seed').argv;
const _         = require('lodash');
const Sequelize = helpers.generic.getSequelize();
const Umzug     = require('umzug');
const clc       = require('cli-color');

module.exports = {
  'db:migrate': {
    descriptions: {
      'short': 'Run pending migrations.',
      'long': [
        'The command runs every not yet executed migration.'
      ]
    },

    task () {
      return getMigrator('migration').then(migrator => {
        return ensureCurrentMetaSchema(migrator).then(() => {
          return migrator.pending();
        }).then(migrations => {
          if (migrations.length === 0) {
            console.log('No migrations were executed, database schema was already up to date.');
            process.exit(0);
          }
        }).then(() => {
          return migrator.up();
        }).then(() => {
          process.exit(0);
        }).catch(err => {
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

    task () {
      this.preChecks.forEach(preCheck => {
        preCheck();
      });

      return getMigrator('seeder').then(migrator => {
        return migrator.up(args.seed)
          .then(() => {
            process.exit(0);
          })
          .catch(err => {
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

    task () {
      return getMigrator('seeder').then(migrator => {
        return migrator.pending()
          .then(seeders => {
            if (seeders.length === 0) {
              console.log('No seeders found.');
              process.exit(0);
            }

            return migrator.up({migrations: _.chain(seeders).map('file').value()});
          }).then(() => {
            process.exit(0);
          })
          .catch(err => {
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

    task () {
      return getMigrator('seeder').then(migrator => {
        return (
          helpers.umzug.getStorage('seeder') === 'none' ? migrator.pending() : migrator.executed()
        )
          .then(seeders => {
            if (seeders.length === 0) {
              console.log('No seeders found.');
              process.exit(0);
            }

            return migrator.down({migrations: _.chain(seeders).map('file').reverse().value()});
          }).then(() => {
            process.exit(0);
          })
          .catch(err => {
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

    task () {
      this.preChecks.forEach(preCheck => {
        preCheck();
      });

      return getMigrator('seeder').then(migrator => {
        return migrator.down({migrations: args.seed})
          .then(() => {
            process.exit(0);
          })
          .catch(err => {
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

    task () {
      return getMigrator('migration').then(migrator => {
        return ensureCurrentMetaSchema(migrator).then(() => {
          return migrator.executed();
        }).then(migrations => {
          _.forEach(migrations, migration => {
            console.log('up  ', migration.file);
          });
        }).then(() => {
          return migrator.pending();
        }).then(migrations => {
          _.forEach(migrations, migration => {
            console.log('down', migration.file);
          });
        }).then(() => {
          process.exit(0);
        }).catch(err => {
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

    task () {
      return getMigrator('migration').then(migrator => {
        return ensureCurrentMetaSchema(migrator).then(() => {
          return migrator.executed();
        }).then(migrations => {
          if (migrations.length === 0) {
            console.log('No executed migrations found.');
            process.exit(0);
          }
        }).then(() => {
          if (args.name) {
            return migrator.down(args.name);
          } else {
            return migrator.down();
          }
        }).then(() => {
          process.exit(0);
        }).catch(err => {
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

    task () {
      return getMigrator('migration').then(migrator => {
        return ensureCurrentMetaSchema(migrator).then(() => {
          return migrator.executed();
        }).then(migrations => {
          if (migrations.length === 0) {
            console.log('No executed migrations found.');
            process.exit(0);
          }
        }).then(() => {
          const to = args.to || 0;
          return migrator.down({to});
        }).then(() => {
          process.exit(0);
        }).catch(err => {
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

    task () {
      return getMigrator('migration')
        .then(migrator => {
          return tryToMigrateFromOldSchema(migrator)
            .then(items => {
              if (items) {
                console.log('Successfully migrated ' + items.length + ' migrations.');
              }

              process.exit(0);
            }, err => {
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

    task () {
      return getMigrator('migration')
        .then(migrator => {
          return addTimestampsToSchema(migrator)
            .then(items => {
              if (items) {
                console.log('Successfully added timestamps to MetaTable.');
              } else {
                console.log('MetaTable already has timestamps.');
              }

              process.exit(0);
            }, err => {
              console.error(err);
              process.exit(1);
            });
        });
    }
  }
};

function ensureCurrentMetaSchema (migrator) {
  const queryInterface  = migrator.options.storageOptions.sequelize.getQueryInterface();
  const tableName  = migrator.options.storageOptions.tableName;
  const columnName = migrator.options.storageOptions.columnName;
  const config = helpers.config.readConfig();

  return ensureMetaTable(queryInterface, tableName)
    .then(table => {
      const columns = Object.keys(table);

      if (columns.length === 1 && columns[0] === columnName) {
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
    () => {
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
    .then(tableNames => {
      if (tableNames.indexOf(tableName) === -1) {
        throw new Error('No MetaTable table found.');
      }
    })
    .then(() => {
      return queryInterface.describeTable(tableName);
    });
}

function getSequelizeInstance () {
  let config  = null;

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
    const sequelize = getSequelizeInstance();
    const migrator  = new Umzug({
      storage:        helpers.umzug.getStorage(type),
      storageOptions: helpers.umzug.getStorageOptions(type, { sequelize }),
      logging:        console.log,
      migrations:     {
        params:  [ sequelize.getQueryInterface(), Sequelize ],
        path:    helpers.path.getPath(type),
        pattern: helpers.config.supportsCoffee() ? /\.js$|\.coffee$/ : /\.js$/,
        wrap (fun) {
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
      .then(() => {
        return migrator;
      })
      .catch(err => {
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
  const sequelize      = migrator.options.storageOptions.sequelize;
  const queryInterface = sequelize.getQueryInterface();

  return ensureMetaTable(queryInterface, 'SequelizeMeta')
    .then(table => {
      if (JSON.stringify(Object.keys(table).sort()) === JSON.stringify(['id', 'from', 'to'])) {
        return;
      }
      return queryInterface.renameTable('SequelizeMeta', 'SequelizeMetaBackup')
        .then(() => {
          const sql = queryInterface.QueryGenerator.selectQuery('SequelizeMetaBackup');

          return helpers.generic.execQuery(sequelize, sql, { type: 'SELECT', raw: true });
        })
        .then(result => {
          const timestamps = result.map(item => {
            return item.to;
          });
          const files      = fs.readdirSync(helpers.path.getPath('migration'));

          return files.filter(file => {
            const match = file.match(/(\d+)-?/);

            if (match) {
              const timestamp = match[0].replace('-', '');

              return timestamps.indexOf(timestamp) > -1;
            }
          });
        })
        .then(files => {
          const SequelizeMeta = sequelize.define('SequelizeMeta', {
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

          return SequelizeMeta.sync().then(() => {
            return SequelizeMeta.bulkCreate(
              files.map(file => {
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
  const sequelize      = migrator.options.storageOptions.sequelize;
  const queryInterface = sequelize.getQueryInterface();
  const tableName      = migrator.options.storageOptions.tableName;

  return ensureMetaTable(queryInterface, tableName)
    .then(table => {
      if (table.createdAt) {
        return;
      }

      return ensureCurrentMetaSchema(migrator)
        .then(() => {
          return queryInterface.renameTable(tableName, tableName + 'Backup');
        })
        .then(() => {
          const sql = queryInterface.QueryGenerator.selectQuery(tableName + 'Backup');

          return helpers.generic.execQuery(sequelize, sql, { type: 'SELECT', raw: true });
        })
        .then(result => {
          const SequelizeMeta = sequelize.define(tableName, {
            name: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
              primaryKey: true,
              autoIncrement: false
            }
          }, {
            tableName,
            timestamps: true
          });

          return SequelizeMeta.sync()
            .then(() => {
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

  args.seed.forEach((file, ind) => {
    args.seed[ind] = path.basename(file);
  });
}
