import process from 'process';
import { _baseOptions } from '../core/yargs';
import { getMigrator, ensureCurrentMetaSchema } from '../core/migrator';

import { helpers } from '../helpers';
import { Argv } from 'yargs';

export const migrateUndoAllBuilder = (yargs: Argv) =>
  _baseOptions(yargs).option('to', {
    describe: 'Revert to the provided migration',
    default: 0,
    type: 'string',
  }).argv;

type BuilderArgType = ReturnType<typeof migrateUndoAllBuilder>;

export default async function (args: BuilderArgType) {
  // legacy, gulp used to do this
  await helpers.config.init();

  await migrationUndoAll(args);

  process.exit(0);
}

function migrationUndoAll(args: BuilderArgType) {
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
        .then(() => migrator.down({ to: String(args?.to ?? 0) }));
    })
    .catch((e) => helpers.view.error(e));
}
