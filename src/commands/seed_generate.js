import { _baseOptions } from '../helpers/yargs';

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('name', {
        describe: 'Defines the name of the seed',
        type: 'string',
        demandOption: true
      })
      .help()
      .argv;

exports.handler = function (args) {
};
