import { _baseOptions, _underscoreOption } from '../core/yargs';

import helpers from '../helpers';
import fs from 'fs';
import clc from 'cli-color';

const ext = {
  ts: 'ts',
  js: 'js',
};

exports.builder = (yargs) =>
  _underscoreOption(
    _baseOptions(yargs).option('name', {
      describe: 'Defines the name of the migration',
      type: 'string',
      demandOption: true,
    })
  ).argv;

exports.handler = function (args) {
  helpers.init.createMigrationsFolder();
  const path = fs.existsSync(`migrations/skeleton.${ext.ts}`)
    ? `migrations/skeleton.${ext.ts}`
    : `migrations/skeleton.${ext.js}`;
  fs.writeFileSync(
    helpers.path.getMigrationPath(args.name),
    helpers.template.render(
      path,
      {},
      {
        beautify: false,
      }
    )
  );

  helpers.view.log(
    'New migration was created at',
    clc.blueBright(helpers.path.getMigrationPath(args.name)),
    '.'
  );

  process.exit(0);
};
