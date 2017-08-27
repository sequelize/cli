import { _baseOptions } from '../helpers/yargs';
import { getMigrator } from '../helpers/migrator';

import helpers from '../helpers';

exports.builder = yargs => _baseOptions(yargs).help().argv;
exports.handler = async function (args) {
  const command = args._[0];

  switch (command) {
    case 'db:seed:all':
      await seedAll(args);
      break;

    case 'db:seed:undo:all':
      await seedUndoAll(args);
      break;
  }
};

function seedAll(args) {
  return getMigrator('seeder', args).then(migrator => {
    return migrator.pending()
      .then(seeders => {
        if (seeders.length === 0) {
          console.log('No seeders found.');
          process.exit(0);
        }

        return migrator.up({ migrations: _.chain(seeders).map('file').value() });
      })
      .catch(err => {
        console.error('Seed file failed with error:', err.message, err.stack);
        process.exit(1);
      });
  });
}

function seedUndoAll(args) {
  return getMigrator('seeder', args).then(migrator => {
    return (
      helpers.umzug.getStorage('seeder') === 'none' ? migrator.pending() : migrator.executed()
    )
      .then(seeders => {
        if (seeders.length === 0) {
          console.log('No seeders found.');
          process.exit(0);
        }

        return migrator.down({ migrations: _.chain(seeders).map('file').reverse().value() });
      })
      .catch(err => {
        console.error('Seed file failed with error:', err.message, err.stack);
        process.exit(1);
      });
  });
}
