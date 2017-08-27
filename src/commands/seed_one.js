import { _baseOptions } from '../helpers/yargs';
import { getMigrator } from '../helpers/migrator';

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
  await getMigrator('seeder', args).then(migrator => {
    return migrator.up(args.seed)
      .catch(err => {
        console.error('Seed file failed with error:', err.message, err.stack);
        process.exit(1);
      });
  });
};
