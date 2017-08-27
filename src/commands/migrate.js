import { _baseOptions } from '../helpers/yargs';
import { getMigrator, ensureCurrentMetaSchema } from '../helpers/migrator';

import helpers from '../helpers';

exports.builder = yargs => _baseOptions(yargs).help().argv;
exports.handler = async function (args) {
  const command = args._[0];

  // legacy, gulp used to do this
  await helpers.config.init();

  switch (command) {
    case 'db:migrate':
      await migrate(args);
      break;
  }
};

function migrate (args) {
  return getMigrator('migration', args).then(migrator => {
    return ensureCurrentMetaSchema(migrator).then(() => {
      return migrator.pending();
    }).then(migrations => {
      if (migrations.length === 0) {
        console.log('No migrations were executed, database schema was already up to date.');
        process.exit(0);
      }
    }).then(() => {
      return migrator.up();
    }).then(() => {
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
  });
}
