'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const packageJson = require(_path2.default.resolve(__dirname, '..', '..', 'package.json'));

module.exports = {
  getCliVersion() {
    return packageJson.version;
  },

  getOrmVersion() {
    return _index2.default.generic.getSequelize('package.json').version;
  },

  getDialect() {
    try {
      return _index2.default.config.readConfig();
    } catch (e) {
      return null;
    }
  },

  getDialectName() {
    const config = this.getDialect();

    if (config) {
      return {
        'sqlite': 'sqlite3',
        'postgres': 'pg',
        'postgresql': 'pg',
        'mariadb': 'mariasql',
        'mysql': 'mysql'
      }[config.dialect];
    } else {
      return null;
    }
  },

  getNodeVersion() {
    return process.version.replace('v', '');
  }
};