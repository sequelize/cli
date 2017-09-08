import { _baseOptions } from '../core/yargs';
import { getMigrator, ensureCurrentMetaSchema, addTimestampsToSchema } from '../core/migrator';

import helpers from '../helpers';
import _ from 'lodash';

exports.builder = yargs => _baseOptions(yargs).help().argv;
exports.handler = async function (args) {
  const command = args._[0];

  // legacy, gulp used to do this
  await helpers.config.init();

  switch (command) {
    case 'db:migrate':
      await migrate(args);
      break;
    case 'db:migrate:schema:timestamps:add':
      await migrateSchemaTimestampAdd(args);
      break;
    case 'db:migrate:status':
      await migrationStatus(args);
      break;
  }

  process.exit(0);
};

function migrate(args) {
  return getMigrator('migration', args).then(migrator => {
    return ensureCurrentMetaSchema(migrator)
      .then(() =>  migrator.pending())
      .then(migrations => {
        if (migrations.length === 0) {
          console.log('No migrations were executed, database schema was already up to date.');
          process.exit(0);
        }
      })
      .then(() => migrator.up())
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });
}

function migrationStatus(args) {
  return getMigrator('migration', args).then(migrator => {
    return ensureCurrentMetaSchema(migrator)
      .then(() => migrator.executed())
      .then(migrations => {
        _.forEach(migrations, migration => {
          console.log('up', migration.file);
        });
      }).then(() => migrator.pending())
      .then(migrations => {
        _.forEach(migrations, migration => {
          console.log('down', migration.file);
        });
      }).catch(err => {
        console.error(err);
        process.exit(1);
      });
  });
}

function migrateSchemaTimestampAdd(args) {
  return getMigrator('migration', args).then(migrator => {
    return addTimestampsToSchema(migrator)
      .then(items => {
        if (items) {
          console.log('Successfully added timestamps to MetaTable.');
        } else {
          console.log('MetaTable already has timestamps.');
        }
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });
}
