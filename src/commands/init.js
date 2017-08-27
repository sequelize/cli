import { _baseOptions } from '../helpers/yargs';
import helpers from '../helpers';

exports.builder = yargs => _baseOptions(yargs)
  .option('force', {
    describe: 'Will drop the existing config folder and re-create it',
    type: 'boolean',
    default: false
  })
  .help()
  .argv;

exports.handler = async function (argv) {
  const command = argv._[0];

  switch (command) {
    case 'init':
      initConfig(argv);
      initModels(argv);
      initMigrations(argv);
      initSeeders(argv);
      break;

    case 'init:config':
      initConfig(argv);
      break;

    case 'init:models':
      initModels(argv);
      break;

    case 'init:migrations':
      initMigrations(argv);
      break;

    case 'init:seeders':
      initSeeders(argv);
      break;
  }
};

function initConfig(args) {
  if (!helpers.config.configFileExists() || !!args.force) {
    helpers.config.writeDefaultConfig();
    console.log('Created "' + helpers.config.relativeConfigFile() + '"');
  } else {
    helpers.init.notifyAboutExistingFile(helpers.config.relativeConfigFile());
    process.exit(1);
  }
}

function initModels(args) {
  helpers.init.createModelsFolder(!!args.force);
  helpers.init.createModelsIndexFile(!!args.force);
}

function initMigrations(args) {
  helpers.init.createMigrationsFolder(!!args.force);
}

function initSeeders(args) {
  helpers.init.createSeedersFolder(!!args.force);
}