import process from 'process';
import { _baseOptions } from '../core/yargs';

import { helpers } from '../helpers';
import fs from 'fs';
import clc from 'cli-color';
import { Argv } from 'yargs';

export const seedGenerateBuilder = (yargs: Argv) =>
  _baseOptions(yargs).option('name', {
    describe: 'Defines the name of the seed',
    type: 'string',
    demandOption: true,
  }).argv;

type BuilderArgType = ReturnType<typeof seedGenerateBuilder>;

export default function (args: BuilderArgType) {
  helpers.init.createSeedersFolder();

  fs.writeFileSync(
    helpers.path.getSeederPath(args.name ?? ''),
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
    clc.blueBright(helpers.path.getSeederPath(args.name ?? '')),
    '.'
  );

  process.exit(0);
}
