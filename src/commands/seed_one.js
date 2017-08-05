import { _baseOptions } from '../helpers/yargs';

exports.builder =
  yargs =>
    _baseOptions(yargs)
    .option('seed', {
      describe: 'List of seed files to unseed',
      type: 'string'
    })
    .help()
    .argv;

exports.handler = function () {};
