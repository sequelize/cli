import { _baseOptions } from '../helpers/yargs';
import { getMigrator } from '../helpers/migrator';

import helpers from '../helpers';

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('seed', {
        describe: 'List of seed files to unseed',
        type: 'string'
      })
      .help()
      .argv;

exports.handler = async function (args) {
  const command = args._[0];

  // legacy, gulp used to do this
  await helpers.config.init();

  switch (command) {
    case 'db:seed':
      await getMigrator('seeder', args).then(migrator => {
        return migrator.up(args.seed)
          .catch(err => {
            console.error('Seed file failed with error:', err.message, err.stack);
            process.exit(1);
          });
      });
      break;

    case 'db:seed:undo':
      await getMigrator('seeder', args).then(migrator => {
        return migrator.down({ migrations: args.seed })
          .catch(err => {
            console.error('Seed file failed with error:', err.message, err.stack);
            process.exit(1);
          });
      });
      break;
  }
};

