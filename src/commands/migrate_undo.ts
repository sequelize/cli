import process from 'process';
import { _baseOptions } from '../core/yargs';
import { getMigrator, ensureCurrentMetaSchema } from '../core/migrator';

import { helpers } from '../helpers';
import { Argv } from 'yargs';

export const migrateUndoBuilder = (yargs: Argv) =>
  _baseOptions(yargs).option('name', {
    describe: 'Name of the migration to undo',
    type: 'string',
  }).argv;

type BuilderArgType = ReturnType<typeof migrateUndoBuilder>;

export default async function (args: BuilderArgType) {
  // legacy, gulp used to do this
  await helpers.config.init();

  await migrateUndo(args);

  process.exit(0);
}

function migrateUndo(args: BuilderArgType) {
  return getMigrator('migration', args)
    .then((migrator) => {
      return ensureCurrentMetaSchema(migrator)
        .then(() => migrator.executed())
        .then((migrations) => {
          if (migrations.length === 0) {
            helpers.view.log('No executed migrations found.');
            process.exit(0);
          }
        })
        .then(() => {
          if (args.name) {
            return migrator.down(args.name);
          } else {
            return migrator.down();
          }
        });
    })
    .catch((e) => helpers.view.error(e));
}
