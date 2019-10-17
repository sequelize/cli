'use strict';

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _yargs = require('../core/yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const args = (0, _yargs2.default)().argv;

module.exports = {
  teaser() {
    const versions = ['Node: ' + _index2.default.version.getNodeVersion(), 'CLI: ' + _index2.default.version.getCliVersion(), 'ORM: ' + _index2.default.version.getOrmVersion()];

    this.log();
    this.log(_cliColor2.default.underline('Sequelize CLI [' + versions.join(', ') + ']'));
    this.log();
  },

  log() {
    console.log.apply(this, arguments);
  },

  error(error) {
    let message = error;

    if (error instanceof Error) {
      message = !args.debug ? error.message : error.stack;
    }

    this.log();
    console.error(`${_cliColor2.default.red('ERROR:')} ${message}`);
    this.log();

    process.exit(1);
  },

  warn(message) {
    this.log(`${_cliColor2.default.yellow('WARNING:')} ${message}`);
  },

  notifyAboutExistingFile(file) {
    this.error('The file ' + _cliColor2.default.blueBright(file) + ' already exists. ' + 'Run command with --force to overwrite it.');
  },

  pad(s, smth) {
    let margin = smth;

    if (_lodash2.default.isObject(margin)) {
      margin = Object.keys(margin);
    }

    if (Array.isArray(margin)) {
      margin = Math.max.apply(null, margin.map(o => {
        return o.length;
      }));
    }

    return s + new Array(margin - s.length + 1).join(' ');
  }
};