'use strict';

const { _baseOptions } = require('../core/yargs');
const { getMigrator, ensureCurrentMetaSchema } = require('../core/migrator');

const helpers = require('../helpers');

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('to', {
        describe: 'Revert to the provided migration',
        default: 0,
        type: 'string'
      })
      .argv;

exports.handler = async function(args) {
  // legacy, gulp used to do this
  await helpers.config.init();

  await migrationUndoAll(args);

  process.exit(0);
};

function migrationUndoAll(args) {
  return getMigrator('migration', args).then(migrator => {
    return ensureCurrentMetaSchema(migrator).then(() => migrator.executed())
      .then(migrations => {
        if (migrations.length === 0) {
          helpers.view.log('No executed migrations found.');
          process.exit(0);
        }
      })
      .then(() => migrator.down({ to: args.to || 0 }));
  }).catch(e => helpers.view.error(e));
}
