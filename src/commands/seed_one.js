import { _baseOptions } from '../core/yargs';
import { getMigrator } from '../core/migrator';

import helpers from '../helpers';
import path from 'path';
import _ from 'lodash';

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('seed', {
        describe: 'List of seed files',
        type: 'array'
      })
      .argv;

exports.handler = async function (args) {
  const command = args._[0];

  // legacy, gulp used to do this
  await helpers.config.init();

  // filter out cmd names
  // for case like --seeders-path seeders --seed seedPerson.js db:seed
  const seeds= (args.seed || [])
    .filter(name => name !== 'db:seed' && name !== 'db:seed:undo')
    .map(file => path.basename(file));


  switch (command) {
    case 'db:seed':
      await getMigrator('seeder', args).then(migrator => {
        return migrator.up(seeds);
      }).catch(e => helpers.view.error(e));
      break;

    case 'db:seed:undo':
      await seedUndo(args);
      break;
  }

  process.exit(0);
};

function seedUndo (args) {
  return getMigrator('seeder', args).then(migrator => {
    return (
      helpers.umzug.getStorage('seeder') === 'none' ? migrator.pending() : migrator.executed()
    )
      .then(seeders => {
        if (args.seed) {
          seeders = seeders.filter(seed => {
            return args.seed.includes(seed.file);
          });
        }

        if (seeders.length === 0) {
          helpers.view.log('No seeders found.');
          return;
        }

        if (!args.seed) {
          seeders = seeders.slice(-1);
        }

        return migrator.down({ migrations: _.chain(seeders).map('file').reverse().value() });
      });
  }).catch(e => helpers.view.error(e));
}
