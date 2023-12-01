import process from 'process';
import { _baseOptions, _underscoreOption } from '../core/yargs';

import { helpers } from '../helpers';
import fs from 'fs';
import clc from 'cli-color';
import { Argv } from 'yargs';

export const migrationGenerateBuilder = (yargs: Argv) =>
  _underscoreOption(
    _baseOptions(yargs).option('name', {
      describe: 'Defines the name of the migration',
      type: 'string',
      demandOption: true,
    })
  ).argv;

type BuilderArgType = ReturnType<typeof migrationGenerateBuilder>;

export default async function (args: BuilderArgType) {
  helpers.init.createMigrationsFolder();

  fs.writeFileSync(
    helpers.path.getMigrationPath(args.name),
    helpers.template.render(
      'migrations/skeleton.js',
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
}
