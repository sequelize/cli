import { _baseOptions } from '../core/yargs';
import { getMigrator, ensureCurrentMetaSchema } from '../core/migrator';

import helpers from '../helpers';

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('name', {
        describe: 'Name of the migration to undo',
        type: 'string'
      })
      .help()
      .argv;

exports.handler = async function (args) {
  // legacy, gulp used to do this
  await helpers.config.init();

  await migrateUndo(args);

  process.exit(0);
};

function migrateUndo (args) {
  return getMigrator('migration', args).then(migrator => {
    return ensureCurrentMetaSchema(migrator).then(() => migrator.executed())
      .then(migrations => {
        if (migrations.length === 0) {
          console.log('No executed migrations found.');
          process.exit(0);
        }
      })
      .then(() => {
        if (args.name) {
          return migrator.down(args.name);
        } else {
          return migrator.down();
        }
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });
}