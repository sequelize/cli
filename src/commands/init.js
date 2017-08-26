import { _baseOptions } from '../helpers/yargs';

exports.builder = yargs => _baseOptions(yargs)
  .option('force', {
    describe: 'Will drop the existing config folder and re-create it',
    type: 'boolean',
    default: false
  })
  .help()
  .argv;

exports.handler = function (argv) {
  const command = argv._[0];

  switch (command) {
    case 'init' :
      break;

    case 'init:config' :
      break;

    case 'init:models' :
      break;

    case 'init:migrations' :
      break;

    case 'init:seeders' :
      break;
  }
};
