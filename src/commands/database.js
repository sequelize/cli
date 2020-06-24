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
  ]);

  const queryInterface = sequelize.getQueryInterface();
  const queryGenerator =
    queryInterface.queryGenerator || queryInterface.QueryGenerator;

  const query = getCreateDatabaseQuery(sequelize, config, options);

  switch (command) {
    case 'db:create':
      await sequelize
        .query(query, {
          type: sequelize.QueryTypes.RAW,
        })
        .catch((e) => helpers.view.error(e));

      helpers.view.log('Database', clc.blueBright(config.database), 'created.');

      break;
    case 'db:drop':
      await sequelize
        .query(
          `DROP DATABASE IF EXISTS ${queryGenerator.quoteIdentifier(
            config.database
          )}`,
          {
            type: sequelize.QueryTypes.RAW,
          }
        )
        .catch((e) => helpers.view.error(e));

      helpers.view.log('Database', clc.blueBright(config.database), 'dropped.');

      break;
  }

  process.exit(0);
};

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
