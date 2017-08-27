import helpers from './index';

const Sequelize = helpers.generic.getSequelize();
import Umzug from 'umzug';
import Bluebird from 'bluebird';
import _ from 'lodash';
import fs from 'fs';

function logMigrator(s) {
  if (s.indexOf('Executing') !== 0) {
    helpers.view.log(s);
  }
}

function getSequelizeInstance() {
  let config = null;

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

export function getMigrator(type, args) {
  return Bluebird.try(() => {
    if (!(helpers.config.configFileExists() || args.url)) {
      console.log(
        'Cannot find "' + helpers.config.getConfigFile() +
        '". Have you run "sequelize init"?'
      );
      process.exit(1);
    }

    const sequelize = getSequelizeInstance();
    const migrator = new Umzug({
      storage: helpers.umzug.getStorage(type),
      storageOptions: helpers.umzug.getStorageOptions(type, { sequelize }),
      logging: console.log,
      migrations: {
        params: [sequelize.getQueryInterface(), Sequelize],
        path: helpers.path.getPath(type),
        pattern: /\.js$/,
        wrap: fun => {
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
      .then(() => migrator)
      .catch(err => {
        console.error('Unable to connect to database: ' + err);
        process.exit(1);
      });
  });
}

export function ensureCurrentMetaSchema(migrator) {
  const queryInterface = migrator.options.storageOptions.sequelize.getQueryInterface();
  const tableName = migrator.options.storageOptions.tableName;
  const columnName = migrator.options.storageOptions.columnName;
  const config = helpers.config.readConfig();

  return ensureMetaTable(queryInterface, tableName)
    .then(table => {
      const columns = Object.keys(table);

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
    })
    .catch(() => { });
}

function ensureMetaTable(queryInterface, tableName) {
  return queryInterface.showAllTables()
    .then(tableNames => {
      if (tableNames.indexOf(tableName) === -1) {
        throw new Error('No MetaTable table found.');
      }
    })
    .then(queryInterface.describeTable(tableName));
}

/**
 * tryToMigrateFromOldSchema - migrates from old schema
 *
 * @return {Promise}
 */
function tryToMigrateFromOldSchema(migrator) {
  const sequelize = migrator.options.storageOptions.sequelize;
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
          const timestamps = result.map(item => item.to);
          const files = fs.readdirSync(helpers.path.getPath('migration'));

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
            tableName: 'SequelizeMeta',
            timestamps: false
          });

          return SequelizeMeta.sync().then(() => {
            return SequelizeMeta.bulkCreate(
              files.map(file => ({ name: file }))
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
export function addTimestampsToSchema(migrator) {
  const sequelize = migrator.options.storageOptions.sequelize;
  const queryInterface = sequelize.getQueryInterface();
  const tableName = migrator.options.storageOptions.tableName;

  return ensureMetaTable(queryInterface, tableName)
    .then(table => {
      if (table.createdAt) {
        return;
      }

      return ensureCurrentMetaSchema(migrator)
        .then(() => queryInterface.renameTable(tableName, tableName + 'Backup'))
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