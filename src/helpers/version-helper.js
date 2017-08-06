

const path        = require('path');
const packageJson = require(path.resolve(__dirname, '..', '..', 'package.json'));
const helpers     = require(__dirname);
const findup      = require('findup-sync');

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

  getDialectVersion () {
    const adapterName = this.getDialectName();

    try {
      if (adapterName) {
        return require(
          findup('package.json')
        ).dependencies[adapterName];
      }
    } catch (e) {
    }

    return null;
  },

  getDialectName () {
    const config = this.getDialect();

    if (config) {
      return {
        'sqlite':   'sqlite3',
        'postgres': 'pg',
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
