import process from 'process';
import { _baseOptions } from '../core/yargs';
import { helpers } from '../helpers';
import { Argv } from 'yargs';

export function initBuilder(yargs: Argv) {
  return _baseOptions(yargs).option('force', {
    describe: 'Will drop the existing config folder and re-create it',
    type: 'boolean',
    default: false,
  }).argv;
}

type BuilderArgType = ReturnType<typeof initBuilder>;

export default async function initHandler(argv: BuilderArgType) {
  const command = argv._[0];

  switch (command) {
    case 'init':
      await initConfig(argv);
      await initModels(argv);
      await initMigrations(argv);
      await initSeeders(argv);
      break;

    case 'init:config':
      await initConfig(argv);
      break;

    case 'init:models':
      await initModels(argv);
      break;

    case 'init:migrations':
      await initMigrations(argv);
      break;

    case 'init:seeders':
      await initSeeders(argv);
      break;
  }

  process.exit(0);
}

function initConfig(args: BuilderArgType) {
  if (!helpers.config.configFileExists() || !!args.force) {
    helpers.config.writeDefaultConfig();
    helpers.view.log('Created "' + helpers.config.relativeConfigFile() + '"');
  } else {
    helpers.view.notifyAboutExistingFile(helpers.config.relativeConfigFile());
    process.exit(1);
  }
}

function initModels(args: BuilderArgType) {
  helpers.init.createModelsFolder(!!args.force);
  helpers.init.createModelsIndexFile(!!args.force);
}

function initMigrations(args: BuilderArgType) {
  helpers.init.createMigrationsFolder(!!args.force);
}

function initSeeders(args: BuilderArgType) {
  helpers.init.createSeedersFolder(!!args.force);
}
