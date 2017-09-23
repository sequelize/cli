import { _baseOptions, _underscoreOption } from '../core/yargs';

import helpers from '../helpers';
import clc from 'cli-color';

exports.builder =
  yargs =>
    _underscoreOption(
      _baseOptions(yargs)
        .option('name', {
          describe: 'Defines the name of the new model',
          type: 'string',
          demandOption: true
        })
        .option('attributes', {
          describe: 'A list of attributes',
          type: 'string',
          demandOption: true
        })
    )
      .help()
      .argv;

exports.handler = function (args) {
  ensureModelsFolder();
  ensureMigrationsFolder();
  checkModelFileExistence(args);

  helpers.model.generateFile(args);
  helpers.migration.generateTableCreationFile(args);
  helpers.view.log(
    'New model was created at',
    clc.blueBright(helpers.path.getModelPath(args.name)),
    '.'
  );
  helpers.view.log(
    'New migration was created at',
    clc.blueBright(helpers.path.getMigrationPath(args.name)),
    '.'
  );

  process.exit(0);
};

function ensureModelsFolder () {
  if (!helpers.path.existsSync(helpers.path.getModelsPath())) {
    helpers.view.error(
      'Unable to find models path (' +
      helpers.path.getModelsPath() +
      '). Did you run ' + clc.blueBright('sequelize init') + '?'
    );
  }
}

function ensureMigrationsFolder () {
  if (!helpers.path.existsSync(helpers.path.getPath('migration'))) {
    helpers.view.error(
      'Unable to find migrations path (' +
      helpers.path.getPath('migration') +
      '). Did you run ' + clc.blueBright('sequelize init') + '?'
    );
  }
}

function checkModelFileExistence (args) {
  const modelPath = helpers.path.getModelPath(args.name);

  if (!args.force && helpers.model.modelFileExists(modelPath)) {
    helpers.view.notifyAboutExistingFile(modelPath);
    process.exit(1);
  }
}