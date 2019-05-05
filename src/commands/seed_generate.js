'use strict';

const { _baseOptions } = require('../core/yargs');

const helpers = require('../helpers');
const fs = require('fs');
const clc = require('cli-color');

exports.builder =
  yargs =>
    _baseOptions(yargs)
      .option('name', {
        describe: 'Defines the name of the seed',
        type: 'string',
        demandOption: true
      })
      .argv;

exports.handler = function(args) {
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

  process.exit(0);
};
