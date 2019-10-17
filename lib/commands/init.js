'use strict';

var _bluebird = require('bluebird');

var _yargs = require('../core/yargs');

var _helpers = require('../helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.builder = yargs => (0, _yargs._baseOptions)(yargs).option('force', {
  describe: 'Will drop the existing config folder and re-create it',
  type: 'boolean',
  default: false
}).argv;

exports.handler = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (argv) {
    const command = argv._[0];

    switch (command) {
      case 'init':
        yield initConfig(argv);
        yield initModels(argv);
        yield initMigrations(argv);
        yield initSeeders(argv);
        break;

      case 'init:config':
        yield initConfig(argv);
        break;

      case 'init:models':
        yield initModels(argv);
        break;

      case 'init:migrations':
        yield initMigrations(argv);
        break;

      case 'init:seeders':
        yield initSeeders(argv);
        break;
    }

    process.exit(0);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

function initConfig(args) {
  if (!_helpers2.default.config.configFileExists() || !!args.force) {
    _helpers2.default.config.writeDefaultConfig();
    _helpers2.default.view.log('Created "' + _helpers2.default.config.relativeConfigFile() + '"');
  } else {
    _helpers2.default.view.notifyAboutExistingFile(_helpers2.default.config.relativeConfigFile());
    process.exit(1);
  }
}

function initModels(args) {
  _helpers2.default.init.createModelsFolder(!!args.force);
  _helpers2.default.init.createModelsIndexFile(!!args.force);
}

function initMigrations(args) {
  _helpers2.default.init.createMigrationsFolder(!!args.force);
}

function initSeeders(args) {
  _helpers2.default.init.createSeedersFolder(!!args.force);
}