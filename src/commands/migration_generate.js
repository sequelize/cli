import { _baseOptions, _underscoreOption } from '../core/yargs';

import helpers from '../helpers';
import fs from 'fs';
import clc from 'cli-color';

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

const writeTemplate = (name, mode) => {
  if (mode === 'sql') {
    fs.writeFileSync(
      helpers.path.getMigrationPath(name, { mode, action: 'down'}),
      '',
    );

    return fs.writeFileSync(
      helpers.path.getMigrationPath(name, { mode, action: 'up'}),
      '',
    );
  }
  return fs.writeFileSync(
    helpers.path.getMigrationPath(name, mode),
    helpers.template.render('migrations/skeleton.js', {}, {
      beautify: false
    }),
  );
}
exports.handler = function (args) {
  helpers.init.createMigrationsFolder();
  writeTemplate(args.name, args['migration-mode']);
  helpers.view.log(
    'New migration was created at',
    clc.blueBright(helpers.path.getMigrationPath(args.name, args['migration-mode'])),
    '.'
  );

  process.exit(0);
};
