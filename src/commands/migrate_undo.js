import { _baseOptions } from '../helpers/yargs';

exports.builder =
  yargs =>
    _baseOptions(yargs)
    .option('name', {
      describe: 'Name of the migration to undo',
      type: 'string'
    })
    .help()
    .argv;

exports.handler = function () {};
