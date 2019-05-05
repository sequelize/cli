'use strict';

const { _baseOptions, _underscoreOption } = require('../core/yargs');

const helpers = require('../helpers');
const fs = require('fs');
const clc = require('cli-color');

exports.builder =
  yargs =>
    _underscoreOption(
      _baseOptions(yargs)
        .option('name', {
          describe: 'Defines the name of the migration',
          type: 'string',
          demandOption: true
        })
    )
      .argv;

exports.handler = function(args) {
  helpers.init.createMigrationsFolder();

  fs.writeFileSync(
    helpers.path.getMigrationPath(args.name),
    helpers.template.render('migrations/skeleton.js', {}, {
      beautify: false
    })
  );

  helpers.view.log(
    'New migration was created at',
    clc.blueBright(helpers.path.getMigrationPath(args.name)),
    '.'
  );

  process.exit(0);
};
