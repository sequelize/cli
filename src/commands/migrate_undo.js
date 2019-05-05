'use strict';

const { _baseOptions } = require('../core/yargs');
const { getMigrator, ensureCurrentMetaSchema } = require('../core/migrator');

const helpers = require('../helpers');

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('name', {
        describe: 'Name of the migration to undo',
        type: 'string'
      })
      .argv;

exports.handler = async function(args) {
  // legacy, gulp used to do this
  await helpers.config.init();

  await migrateUndo(args);

  process.exit(0);
};

function migrateUndo(args) {
  return getMigrator('migration', args).then(migrator => {
    return ensureCurrentMetaSchema(migrator).then(() => migrator.executed())
      .then(migrations => {
        if (migrations.length === 0) {
          helpers.view.log('No executed migrations found.');
          process.exit(0);
        }
      })
      .then(() => {
        if (args.name) {
          return migrator.down(args.name);
        }
        return migrator.down();

      });
  }).catch(e => helpers.view.error(e));
}
