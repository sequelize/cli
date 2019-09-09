import path from 'path';
import helpers from './index';

const packageJson = require(path.resolve(__dirname, '..', '..', 'package.json'));

module.exports = {
  getCliVersion () {
    return packageJson.version;
  },

  getOrmVersion () {
    return helpers.generic.getSequelize('package.json').version;
  },

  getDialect () {
    try {
      return helpers.config.readConfig();
    } catch (e) {
      return null;
    }
  },

  getDialectName () {
    const config = this.getDialect();

    if (config) {
      return {
        'sqlite':   'sqlite3',
        'postgres': 'pg',
        'postgresql': 'pg',
        'mariadb':  'mariasql',
        'mysql':    'mysql'
      }[config.dialect];
    } else {
      return null;
    }
  },

  getNodeVersion () {
    return process.version.replace('v', '');
  }
};
