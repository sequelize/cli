import { _baseOptions } from '../helpers/yargs';

const path      = require('path');
const helpers   = require(path.resolve(__dirname, '..', 'helpers'));
const fs        = require('fs');
const clc       = require('cli-color');

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
  helpers.init.createSeedersFolder();
  
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
};
