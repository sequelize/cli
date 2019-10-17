'use strict';

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _yargs = require('../core/yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const args = (0, _yargs2.default)().argv;

const api = {
  config: undefined,
  rawConfig: undefined,
  error: undefined,
  init() {
    return _bluebird2.default.resolve().then(() => {
      let config;

      if (args.url) {
        config = api.parseDbUrl(args.url);
      } else {
        try {
          config = require(api.getConfigFile());
        } catch (e) {
          api.error = e;
        }
      }
      return config;
    }).then(config => {
      if (typeof config === 'object' || config === undefined) {
        return config;
      } else if (config.length === 1) {
        return _bluebird2.default.promisify(config)();
      } else {
        return config();
      }
    }).then(config => {
      api.rawConfig = config;
    }).then(() => {
      // Always return the full config api
      return api;
    });
  },
  getConfigFile() {
    if (args.config) {
      return _path2.default.resolve(process.cwd(), args.config);
    }

    const defaultPath = _path2.default.resolve(process.cwd(), 'config', 'config.json');
    const alternativePath = defaultPath.replace('.json', '.js');

    return _index2.default.path.existsSync(alternativePath) ? alternativePath : defaultPath;
  },

  relativeConfigFile() {
    return _path2.default.relative(process.cwd(), api.getConfigFile());
  },

  configFileExists() {
    return _index2.default.path.existsSync(api.getConfigFile());
  },

  getDefaultConfig() {
    return JSON.stringify({
      development: {
        username: 'root',
        password: null,
        database: 'database_development',
        host: '127.0.0.1',
        dialect: 'mysql',
        operatorsAliases: false
      },
      test: {
        username: 'root',
        password: null,
        database: 'database_test',
        host: '127.0.0.1',
        dialect: 'mysql',
        operatorsAliases: false
      },
      production: {
        username: 'root',
        password: null,
        database: 'database_production',
        host: '127.0.0.1',
        dialect: 'mysql',
        operatorsAliases: false
      }
    }, undefined, 2) + '\n';
  },

  writeDefaultConfig() {
    const configPath = _path2.default.dirname(api.getConfigFile());

    if (!_index2.default.path.existsSync(configPath)) {
      _index2.default.asset.mkdirp(configPath);
    }

    _fs2.default.writeFileSync(api.getConfigFile(), api.getDefaultConfig());
  },

  readConfig() {
    if (!api.config) {
      const env = _index2.default.generic.getEnvironment();

      if (api.rawConfig === undefined) {
        throw new Error('Error reading "' + api.relativeConfigFile() + '". Error: ' + api.error);
      }

      if (typeof api.rawConfig !== 'object') {
        throw new Error('Config must be an object or a promise for an object: ' + api.relativeConfigFile());
      }

      if (args.url) {
        _index2.default.view.log('Parsed url ' + api.filteredUrl(args.url, api.rawConfig));
      } else {
        _index2.default.view.log('Loaded configuration file "' + api.relativeConfigFile() + '".');
      }

      if (api.rawConfig[env]) {
        _index2.default.view.log('Using environment "' + env + '".');

        api.rawConfig = api.rawConfig[env];
      }

      // The Sequelize library needs a function passed in to its logging option
      if (api.rawConfig.logging && !_lodash2.default.isFunction(api.rawConfig.logging)) {
        api.rawConfig.logging = console.log;
      }

      // in case url is present - we overwrite the configuration
      if (api.rawConfig.url) {
        api.rawConfig = _lodash2.default.merge(api.rawConfig, api.parseDbUrl(api.rawConfig.url));
      } else if (api.rawConfig.use_env_variable) {
        api.rawConfig = _lodash2.default.merge(api.rawConfig, api.parseDbUrl(process.env[api.rawConfig.use_env_variable]));
      }

      api.config = api.rawConfig;
    }
    return api.config;
  },

  filteredUrl(uri, config) {
    const regExp = new RegExp(':?' + _lodash2.default.escapeRegExp(config.password) + '@');
    return uri.replace(regExp, ':*****@');
  },

  urlStringToConfigHash(urlString) {
    try {
      const urlParts = _url2.default.parse(urlString);
      let result = {
        database: urlParts.pathname.replace(/^\//, ''),
        host: urlParts.hostname,
        port: urlParts.port,
        protocol: urlParts.protocol.replace(/:$/, ''),
        ssl: urlParts.query ? urlParts.query.indexOf('ssl=true') >= 0 : false
      };

      if (urlParts.auth) {
        result = _lodash2.default.assign(result, {
          username: urlParts.auth.split(':')[0],
          password: urlParts.auth.split(':')[1]
        });
      }

      return result;
    } catch (e) {
      throw new Error('Error parsing url: ' + urlString);
    }
  },

  parseDbUrl(urlString) {
    let config = api.urlStringToConfigHash(urlString);

    config = _lodash2.default.assign(config, {
      dialect: config.protocol
    });

    if (config.dialect === 'sqlite' && config.database.indexOf(':memory') !== 0) {
      config = _lodash2.default.assign(config, {
        storage: '/' + config.database
      });
    }

    return config;
  }
};

module.exports = api;