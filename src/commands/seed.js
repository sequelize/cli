import { _baseOptions } from '../core/yargs';
import { getMigrator } from '../core/migrator';

import helpers from '../helpers';

exports.builder = yargs => _baseOptions(yargs).argv;
exports.handler = async function (args) {
  const command = args._[0];

  // legacy, gulp used to do this
  await helpers.config.init();

  switch (command) {
    case 'db:seed:all':
      await seedAll(args);
      break;

    case 'db:seed:undo:all':
      await seedUndoAll(args);
      break;
  }

  process.exit(0);
};

function seedAll (args) {
  return getMigrator('seeder', args).then(migrator => {
    return migrator.pending()
      .then(seeders => {
        if (seeders.length === 0) {
          helpers.view.log('No seeders found.');
          return;
        }

        return migrator.up({ migrations: seeders.map(s => s.file) });
      });
  }).catch(e => helpers.view.error(e));
}

function seedUndoAll (args) {
  return getMigrator('seeder', args).then(migrator => {
    return (
      helpers.umzug.getStorage('seeder') === 'none' ? migrator.pending() : migrator.executed()
    )
      .then(seeders => {
        if (seeders.length === 0) {
          helpers.view.log('No seeders found.');
          return;
        }

        return migrator.down({ migrations: seeders.map(s => s.file).reverse() });
      });
  }).catch(e => helpers.view.error(e));
}
