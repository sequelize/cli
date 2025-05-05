import process from 'process';
import { _baseOptions } from '../core/yargs';

import helpers from '../helpers';
import fs from 'fs';
import colors from 'picocolors';

exports.builder = (yargs) =>
  _baseOptions(yargs).option('name', {
    describe: 'Defines the name of the seed',
    type: 'string',
    demandOption: true,
  }).argv;

exports.handler = function (args) {
  helpers.init.createSeedersFolder();

  fs.writeFileSync(
    helpers.path.getSeederPath(args.name),
    helpers.template.render(
      'seeders/skeleton.js',
      {},
      {
        beautify: false,
      }
    )
  );

  helpers.view.log(
    'New seed was created at',
    colors.blueBright(helpers.path.getSeederPath(args.name)),
    '.'
  );

  process.exit(0);
};
