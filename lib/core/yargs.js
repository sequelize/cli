'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getYArgs;
exports._baseOptions = _baseOptions;
exports._underscoreOption = _underscoreOption;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadRCFile(optionsPath) {
  const rcFile = optionsPath || _path2.default.resolve(process.cwd(), '.sequelizerc');
  const rcFileResolved = _path2.default.resolve(rcFile);
  return _fs2.default.existsSync(rcFileResolved) ? JSON.parse(JSON.stringify(require(rcFileResolved))) : {};
}

const args = _yargs2.default.help(false).version(false).config(loadRCFile(_yargs2.default.argv.optionsPath));

function getYArgs() {
  return args;
}

function _baseOptions(yargs) {
  return yargs.option('env', {
    describe: 'The environment to run the command in',
    default: 'development',
    type: 'string'
  }).option('config', {
    describe: 'The path to the config file',
    type: 'string'
  }).option('options-path', {
    describe: 'The path to a JSON file with additional options',
    type: 'string'
  }).option('migrations-path', {
    describe: 'The path to the migrations folder',
    default: 'migrations',
    type: 'string'
  }).option('seeders-path', {
    describe: 'The path to the seeders folder',
    default: 'seeders',
    type: 'string'
  }).option('models-path', {
    describe: 'The path to the models folder',
    default: 'models',
    type: 'string'
  }).option('url', {
    describe: 'The database connection string to use. Alternative to using --config files',
    type: 'string'
  }).option('debug', {
    describe: 'When available show various debug information',
    default: false,
    type: 'boolean'
  });
}

function _underscoreOption(yargs) {
  return yargs.option('underscored', {
    describe: "Use snake case for the timestamp's attribute names",
    default: false,
    type: 'boolean'
  });
}