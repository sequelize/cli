import { _baseOptions } from '../core/yargs';
import { getMigrator } from '../core/migrator';

import helpers from '../helpers';
import path from 'path';

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
      await getMigrator('seeder', args).then(migrator => {
        return migrator.down({ migrations: seeds });
      }).catch(e => helpers.view.error(e));
      break;
  }

  process.exit(0);
};

