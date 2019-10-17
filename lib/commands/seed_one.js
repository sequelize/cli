'use strict';

var _bluebird = require('bluebird');

var _yargs = require('../core/yargs');

var _migrator = require('../core/migrator');

var _helpers = require('../helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.builder = yargs => (0, _yargs._baseOptions)(yargs).option('seed', {
  describe: 'List of seed files',
  type: 'array'
}).argv;

exports.handler = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (args) {
    const command = args._[0];

    // legacy, gulp used to do this
    yield _helpers2.default.config.init();

    // filter out cmd names
    // for case like --seeders-path seeders --seed seedPerson.js db:seed
    const seeds = (args.seed || []).filter(function (name) {
      return name !== 'db:seed' && name !== 'db:seed:undo';
    }).map(function (file) {
      return _path2.default.basename(file);
    });

    switch (command) {
      case 'db:seed':
        yield (0, _migrator.getMigrator)('seeder', args).then(function (migrator) {
          return migrator.up(seeds);
        }).catch(function (e) {
          return _helpers2.default.view.error(e);
        });
        break;

      case 'db:seed:undo':
        yield (0, _migrator.getMigrator)('seeder', args).then(function (migrator) {
          return migrator.down({ migrations: seeds });
        }).catch(function (e) {
          return _helpers2.default.view.error(e);
        });
        break;
    }

    process.exit(0);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();