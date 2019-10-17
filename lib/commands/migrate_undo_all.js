'use strict';

var _bluebird = require('bluebird');

var _yargs = require('../core/yargs');

var _migrator = require('../core/migrator');

var _helpers = require('../helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.builder = yargs => (0, _yargs._baseOptions)(yargs).option('to', {
  describe: 'Revert to the provided migration',
  default: 0,
  type: 'string'
}).argv;

exports.handler = (() => {
  var _ref = (0, _bluebird.coroutine)(function* (args) {
    // legacy, gulp used to do this
    yield _helpers2.default.config.init();

    yield migrationUndoAll(args);

    process.exit(0);
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

function migrationUndoAll(args) {
  return (0, _migrator.getMigrator)('migration', args).then(migrator => {
    return (0, _migrator.ensureCurrentMetaSchema)(migrator).then(() => migrator.executed()).then(migrations => {
      if (migrations.length === 0) {
        _helpers2.default.view.log('No executed migrations found.');
        process.exit(0);
      }
    }).then(() => migrator.down({ to: args.to || 0 }));
  }).catch(e => _helpers2.default.view.error(e));
}