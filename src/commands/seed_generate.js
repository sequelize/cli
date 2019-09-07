import { _baseOptions } from '../core/yargs';

import helpers from '../helpers';
import fs from 'fs';
import clc from 'cli-color';

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('name', {
        describe: 'Defines the name of the seed',
        type: 'string',
        demandOption: true
      })
      .argv;

exports.handler = function (args) {
  helpers.init.createSeedersFolder();
  if (args.raw) {
    helpers.raw.write(helpers.getPath('seed'), args.name);
    helpers.view.log(
      'New seed files was created at',
      clc.blueBright(helpers.path.getPath('seed')),
      '.'
    );
  } else {
    fs.writeFileSync(
      helpers.path.getSeederPath(args.name),
      helpers.template.render('seeders/skeleton.js', {}, {
        beautify: false
      })
    );
  
    helpers.view.log(
      'New seed was created at',
      clc.blueBright(helpers.path.getSeederPath(args.name)),
      '.'
    );
  }

  process.exit(0);
};
