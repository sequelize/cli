import { _baseOptions } from '../helpers/yargs';

exports.builder = yargs => _baseOptions(yargs).help().argv;
exports.handler = async function (args) {
  const command = args._[0];

  switch (command) {
    case 'db:seed:all':
      break;

    case 'db:seed:undo:all':
      break;
  }
};
