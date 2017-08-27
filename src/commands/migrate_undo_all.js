import { _baseOptions } from '../helpers/yargs';
import { getMigrator, ensureCurrentMetaSchema } from '../helpers/migrator';

import helpers from '../helpers';

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('to', {
        describe: 'Revert to the provided migration',
        default: 0,
        type: 'string'
      })
      .help()
      .argv;

exports.handler = async function (args) {
  // legacy, gulp used to do this
  await helpers.config.init();

  await migrationUndoAll(args);
};

function migrationUndoAll (args) {
  return getMigrator('migration', args).then(migrator => {
    return ensureCurrentMetaSchema(migrator).then(() => migrator.executed())
      .then(migrations => {
        if (migrations.length === 0) {
          console.log('No executed migrations found.');
          process.exit(0);
        }
      }).then(() => {
        return migrator.down({
          to: args.to || 0
        });
      }).catch(err => {
        console.error(err);
        process.exit(1);
      });
  });
}