import process from 'process';
import { _baseOptions } from '../core/yargs';
import { logMigrator } from '../core/migrator';

import helpers from '../helpers';
import { cloneDeep, defaults, pick } from 'lodash';
import clc from 'cli-color';

const Sequelize = helpers.generic.getSequelize();

exports.builder = (yargs) =>
  _baseOptions(yargs)
    .option('charset', {
      describe: 'Pass charset option to dialect, MYSQL only',
      type: 'string',
    })
    .option('collate', {
      describe: 'Pass collate option to dialect',
      type: 'string',
    })
    .option('encoding', {
      describe: 'Pass encoding option to dialect, PostgreSQL only',
      type: 'string',
    })
    .option('ctype', {
      describe: 'Pass ctype option to dialect, PostgreSQL only',
      type: 'string',
    })
    .option('template', {
      describe: 'Pass template option to dialect, PostgreSQL only',
      type: 'string',
    })
    .option('force', {
      describe:
        'Pass force option to dialect with db:drop, PostgreSQL > v13 only',
      type: 'boolean',
    }).argv;

exports.handler = async function (args) {
  const command = args._[0];

  // legacy, gulp used to do this
  await helpers.config.init();

  const sequelize = getDatabaseLessSequelize();
  const config = helpers.config.readConfig();
  const options = pick(args, [
    'charset',
    'collate',
    'encoding',
    'ctype',
    'template',
    'force',
  ]);

  const createQuery = getCreateDatabaseQuery(sequelize, config, options);
  const dropQuery = await getDropDatabaseQuery(sequelize, config, options);

  switch (command) {
    case 'db:create':
      await sequelize
        .query(createQuery, {
          type: sequelize.QueryTypes.RAW,
        })
        .catch((e) => helpers.view.error(e));

      helpers.view.log('Database', clc.blueBright(config.database), 'created.');

      break;
    case 'db:drop':
      await sequelize
        .query(dropQuery, {
          type: sequelize.QueryTypes.RAW,
        })
        .catch((e) => helpers.view.error(e));

      helpers.view.log('Database', clc.blueBright(config.database), 'dropped.');

      break;
  }

  process.exit(0);
};

/**
 *
 * @param sequelize
 * @param config
 * @param options
 * @returns {string}
 */
function getCreateDatabaseQuery(sequelize, config, options) {
  const queryInterface = sequelize.getQueryInterface();
  const queryGenerator =
    queryInterface.queryGenerator || queryInterface.QueryGenerator;

  switch (config.dialect) {
    case 'postgres':
    case 'postgres-native':
      return (
        'CREATE DATABASE ' +
        queryGenerator.quoteIdentifier(config.database) +
        (options.encoding
          ? ' ENCODING = ' + queryGenerator.quoteIdentifier(options.encoding)
          : '') +
        (options.collate
          ? ' LC_COLLATE = ' + queryGenerator.quoteIdentifier(options.collate)
          : '') +
        (options.ctype
          ? ' LC_CTYPE = ' + queryGenerator.quoteIdentifier(options.ctype)
          : '') +
        (options.template
          ? ' TEMPLATE = ' + queryGenerator.quoteIdentifier(options.template)
          : '')
      );

    case 'mysql':
      return (
        'CREATE DATABASE IF NOT EXISTS ' +
        queryGenerator.quoteIdentifier(config.database) +
        (options.charset
          ? ' DEFAULT CHARACTER SET ' +
            queryGenerator.quoteIdentifier(options.charset)
          : '') +
        (options.collate
          ? ' DEFAULT COLLATE ' +
            queryGenerator.quoteIdentifier(options.collate)
          : '')
      );

    case 'mssql':
      return (
        "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'" +
        config.database +
        "')" +
        ' BEGIN' +
        ' CREATE DATABASE ' +
        queryGenerator.quoteIdentifier(config.database) +
        (options.collate ? ' COLLATE ' + options.collate : '') +
        ' END;'
      );

    default:
      helpers.view.error(
        `Dialect ${config.dialect} does not support db:create / db:drop commands`
      );
      return (
        'CREATE DATABASE ' + queryGenerator.quoteIdentifier(config.database)
      );
  }
}

/**
 *
 * @param sequelize
 * @returns {Promise<String|null>}
 */
async function getPostgresVersion(sequelize) {
  try {
    const [results] = await sequelize.query(
      `SELECT current_setting('server_version_num')::int AS version`,
      {
        type: sequelize.QueryTypes.RAW,
      }
    );
    return results[0]?.version ?? null;
  } catch (e) {
    return null;
  }
}

/**
 *
 * @param sequelize
 * @param config
 * @param options
 * @returns {Promise<string>}
 */
async function getDropDatabaseQuery(sequelize, config, options) {
  // Adds the force option for WITH(FORCE) to drop a database that has connected users, fallback to default drop if version lower
  // for postgres v13 and above see manual https://www.postgresql.org/docs/current/sql-dropdatabase.html

  const POSTGRES_FORCE_DROP_MIN_VERSION = 130000;
  const queryInterface = sequelize.getQueryInterface();
  const queryGenerator =
    queryInterface.queryGenerator || queryInterface.QueryGenerator;

  switch (config.dialect) {
    case 'postgres':
      if (options.force) {
        const version = await getPostgresVersion(sequelize);
        helpers.view.log(
          clc.redBright(
            `WARNING :: Force dropping database, version check ${
              version < POSTGRES_FORCE_DROP_MIN_VERSION
                ? 'NOT OK!. will ignore --force flag'
                : 'OK!. will force drop database regardless of connected users'
            } `
          )
        );

        return `DROP DATABASE IF EXISTS ${queryGenerator.quoteIdentifier(
          config.database
        )} ${
          Number(version) >= POSTGRES_FORCE_DROP_MIN_VERSION
            ? 'WITH (FORCE)'
            : ''
        } ;`;
      } else
        return `DROP DATABASE IF EXISTS ${queryGenerator.quoteIdentifier(
          config.database
        )}`;

    default:
      return `DROP DATABASE IF EXISTS ${queryGenerator.quoteIdentifier(
        config.database
      )}`;
  }
}

function getDatabaseLessSequelize() {
  let config = null;

  try {
    config = helpers.config.readConfig();
  } catch (e) {
    helpers.view.error(e);
  }

  config = cloneDeep(config);
  config = defaults(config, { logging: logMigrator });

  switch (config.dialect) {
    case 'postgres':
    case 'postgres-native':
      config.database = 'postgres';
      break;

    case 'mysql':
      delete config.database;
      break;

    case 'mssql':
      config.database = 'master';
      break;

    default:
      helpers.view.error(
        `Dialect ${config.dialect} does not support db:create / db:drop commands`
      );
  }

  try {
    return new Sequelize(config);
  } catch (e) {
    helpers.view.error(e);
  }
}
