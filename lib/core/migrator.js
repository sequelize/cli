'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logMigrator = logMigrator;
exports.getMigrator = getMigrator;
exports.ensureCurrentMetaSchema = ensureCurrentMetaSchema;
exports.addTimestampsToSchema = addTimestampsToSchema;

var _umzug = require('umzug');

var _umzug2 = _interopRequireDefault(_umzug);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _index = require('../helpers/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Sequelize = _index2.default.generic.getSequelize();

function logMigrator(s) {
  if (s.indexOf('Executing') !== 0) {
    _index2.default.view.log(s);
  }
}

function getSequelizeInstance() {
  let config = null;

  try {
    config = _index2.default.config.readConfig();
  } catch (e) {
    _index2.default.view.error(e);
  }

  config = _lodash2.default.defaults(config, { logging: logMigrator });

  try {
    return new Sequelize(config);
  } catch (e) {
    _index2.default.view.error(e);
  }
}

function getMigrator(type, args) {
  return _bluebird2.default.try(() => {
    if (!(_index2.default.config.configFileExists() || args.url)) {
      _index2.default.view.error('Cannot find "' + _index2.default.config.getConfigFile() + '". Have you run "sequelize init"?');
      process.exit(1);
    }

    const sequelize = getSequelizeInstance();
    const migrator = new _umzug2.default({
      storage: _index2.default.umzug.getStorage(type),
      storageOptions: _index2.default.umzug.getStorageOptions(type, { sequelize }),
      logging: _index2.default.view.log,
      migrations: {
        params: [sequelize.getQueryInterface(), Sequelize],
        path: _index2.default.path.getPath(type),
        pattern: /\.(t|j)s$/,
        wrap: fun => {
          if (fun.length === 3) {
            return _bluebird2.default.promisify(fun);
          } else {
            return fun;
          }
        }
      }
    });

    return sequelize.authenticate().then(() => {
      // Check if this is a PostgreSQL run and if there is a custom schema specified, and if there is, check if it's
      // been created. If not, attempt to create it.
      if (_index2.default.version.getDialectName() === 'pg') {
        const customSchemaName = _index2.default.umzug.getSchema('migration');
        if (customSchemaName && customSchemaName !== 'public') {
          return sequelize.createSchema(customSchemaName);
        }
      }

      return _bluebird2.default.resolve();
    }).then(() => migrator).catch(e => _index2.default.view.error(e));
  });
}

function ensureCurrentMetaSchema(migrator) {
  const queryInterface = migrator.options.storageOptions.sequelize.getQueryInterface();
  const tableName = migrator.options.storageOptions.tableName;
  const columnName = migrator.options.storageOptions.columnName;

  return ensureMetaTable(queryInterface, tableName).then(table => {
    const columns = Object.keys(table);

    if (columns.length === 1 && columns[0] === columnName) {
      return;
    } else if (columns.length === 3 && columns.indexOf('createdAt') >= 0) {
      return;
    }
  }).catch(() => {});
}

function ensureMetaTable(queryInterface, tableName) {
  return queryInterface.showAllTables().then(tableNames => {
    if (tableNames.indexOf(tableName) === -1) {
      throw new Error('No MetaTable table found.');
    }
    return queryInterface.describeTable(tableName);
  });
}

/**
 * Add timestamps
 *
 * @return {Promise}
 */
function addTimestampsToSchema(migrator) {
  const sequelize = migrator.options.storageOptions.sequelize;
  const queryInterface = sequelize.getQueryInterface();
  const tableName = migrator.options.storageOptions.tableName;

  return ensureMetaTable(queryInterface, tableName).then(table => {
    if (table.createdAt) {
      return;
    }

    return ensureCurrentMetaSchema(migrator).then(() => queryInterface.renameTable(tableName, tableName + 'Backup')).then(() => {
      const sql = queryInterface.QueryGenerator.selectQuery(tableName + 'Backup');
      return _index2.default.generic.execQuery(sequelize, sql, { type: 'SELECT', raw: true });
    }).then(result => {
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
        timestamps: true,
        schema: _index2.default.umzug.getSchema()
      });

      return SequelizeMeta.sync().then(() => {
        return SequelizeMeta.bulkCreate(result);
      });
    });
  });
}