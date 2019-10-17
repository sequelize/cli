'use strict';

var _yargs = require('../core/yargs');

var _helpers = require('../helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.builder = yargs => (0, _yargs._underscoreOption)((0, _yargs._baseOptions)(yargs).option('name', {
  describe: 'Defines the name of the new model',
  type: 'string',
  demandOption: true
}).option('attributes', {
  describe: 'A list of attributes',
  type: 'string',
  demandOption: true
}).option('force', {
  describe: 'Forcefully re-creates model with the same name',
  type: 'string',
  demandOption: false
})).argv;

exports.handler = function (args) {
  ensureModelsFolder();
  ensureMigrationsFolder();
  checkModelFileExistence(args);

  try {
    _helpers2.default.model.generateFile(args);
  } catch (err) {
    _helpers2.default.view.error(err.message);
  }

  _helpers2.default.migration.generateTableCreationFile(args);
  _helpers2.default.view.log('New model was created at', _cliColor2.default.blueBright(_helpers2.default.path.getModelPath(args.name)), '.');
  _helpers2.default.view.log('New migration was created at', _cliColor2.default.blueBright(_helpers2.default.path.getMigrationPath(args.name)), '.');

  process.exit(0);
};

function ensureModelsFolder() {
  if (!_helpers2.default.path.existsSync(_helpers2.default.path.getModelsPath())) {
    _helpers2.default.view.error('Unable to find models path (' + _helpers2.default.path.getModelsPath() + '). Did you run ' + _cliColor2.default.blueBright('sequelize init') + '?');
  }
}

function ensureMigrationsFolder() {
  if (!_helpers2.default.path.existsSync(_helpers2.default.path.getPath('migration'))) {
    _helpers2.default.view.error('Unable to find migrations path (' + _helpers2.default.path.getPath('migration') + '). Did you run ' + _cliColor2.default.blueBright('sequelize init') + '?');
  }
}

function checkModelFileExistence(args) {
  const modelPath = _helpers2.default.path.getModelPath(args.name);

  if (args.force === undefined && _helpers2.default.model.modelFileExists(modelPath)) {
    _helpers2.default.view.notifyAboutExistingFile(modelPath);
    process.exit(1);
  }
}