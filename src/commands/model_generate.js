import process from 'process';
import { _baseOptions, _underscoreOption } from '../core/yargs';

import helpers from '../helpers';
import colors from 'picocolors';

exports.builder = (yargs) =>
  _underscoreOption(
    _baseOptions(yargs)
      .option('name', {
        describe: 'Defines the name of the new model',
        type: 'string',
        demandOption: true,
      })
      .option('attributes', {
        describe: 'A list of attributes',
        type: 'string',
        demandOption: true,
      })
      .option('force', {
        describe: 'Forcefully re-creates model with the same name',
        type: 'string',
        demandOption: false,
      })
  ).argv;

exports.handler = function (args) {
  ensureModelsFolder();
  ensureMigrationsFolder();
  checkModelFileExistence(args);

  try {
    helpers.model.generateFile(args);
  } catch (err) {
    helpers.view.error(err.message);
  }

  helpers.migration.generateTableCreationFile(args);
  helpers.view.log(
    'New model was created at',
    colors.blueBright(helpers.path.getModelPath(args.name)),
    '.'
  );
  helpers.view.log(
    'New migration was created at',
    colors.blueBright(
      helpers.path.getMigrationPath(
        helpers.migration.generateMigrationName(args)
      )
    ),
    '.'
  );

  process.exit(0);
};

function ensureModelsFolder() {
  if (!helpers.path.existsSync(helpers.path.getModelsPath())) {
    helpers.view.error(
      'Unable to find models path (' +
        helpers.path.getModelsPath() +
        '). Did you run ' +
        colors.blueBright('sequelize init') +
        '?'
    );
  }
}

function ensureMigrationsFolder() {
  if (!helpers.path.existsSync(helpers.path.getPath('migration'))) {
    helpers.view.error(
      'Unable to find migrations path (' +
        helpers.path.getPath('migration') +
        '). Did you run ' +
        colors.blueBright('sequelize init') +
        '?'
    );
  }
}

function checkModelFileExistence(args) {
  const modelPath = helpers.path.getModelPath(args.name);

  if (args.force === undefined && helpers.model.modelFileExists(modelPath)) {
    helpers.view.notifyAboutExistingFile(modelPath);
    process.exit(1);
  }
}
