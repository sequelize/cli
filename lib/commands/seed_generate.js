'use strict';

var _yargs = require('../core/yargs');

var _helpers = require('../helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.builder = yargs => (0, _yargs._baseOptions)(yargs).option('name', {
  describe: 'Defines the name of the seed',
  type: 'string',
  demandOption: true
}).argv;

exports.handler = function (args) {
  _helpers2.default.init.createSeedersFolder();

  _fs2.default.writeFileSync(_helpers2.default.path.getSeederPath(args.name), _helpers2.default.template.render('seeders/skeleton.js', {}, {
    beautify: false
  }));

  _helpers2.default.view.log('New seed was created at', _cliColor2.default.blueBright(_helpers2.default.path.getSeederPath(args.name)), '.');

  process.exit(0);
};