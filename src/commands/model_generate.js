import { _baseOptions, _underscoreOption } from '../helpers/yargs';

exports.builder =
  yargs =>
    _underscoreOption(
      _baseOptions(yargs)
        .option('name', {
          describe: 'Defines the name of the new model',
          type: 'string',
          demandOption: true
        })
        .option('attributes', {
          describe: 'A list of attributes',
          type: 'string',
          demandOption: true
        })
    )
      .help()
      .argv;

exports.handler = function (args) {
};