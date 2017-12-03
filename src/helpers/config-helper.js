import Bluebird from 'bluebird';
import path from 'path';
import fs from 'fs';
import url from 'url';
import _ from 'lodash';
import helpers from './index';
import getYArgs from '../core/yargs';

const args = getYArgs().argv;

const api = {
  config: undefined,
  rawConfig: undefined,
  error: undefined,
  init () {
    return Bluebird.resolve()
      .then(() => {
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
      })
      .then(config => {
        if (typeof config === 'object' || config === undefined) {
          return config;
        } else if (config.length === 1) {
          return Bluebird.promisify(config)();
        } else {
          return config();
        }
      })
      .then(config => {
        api.rawConfig = config;
      })
      .then(() => {
        // Always return the full config api
        return api;
      });
  },
  getConfigFile () {
    if (args.config) {
      return path.resolve(process.cwd(), args.config);
    }

    const defaultPath = path.resolve(process.cwd(), 'config', 'config.json');
    const alternativePath = defaultPath.replace('.json', '.js');

    return helpers.path.existsSync(alternativePath) ? alternativePath : defaultPath;
  },

  relativeConfigFile () {
    return path.relative(process.cwd(), api.getConfigFile());
  },

  configFileExists () {
    return helpers.path.existsSync(api.getConfigFile());
  },

  getDefaultConfig () {
    return JSON.stringify({
      development: {
        username: 'root',
        password: null,
        database: 'database_development',
        host: '127.0.0.1',
        dialect: 'mysql'
      },
      test: {
        username: 'root',
        password: null,
        database: 'database_test',
        host: '127.0.0.1',
        dialect: 'mysql'
      },
      production: {
        username: 'root',
        password: null,
        database: 'database_production',
        host: '127.0.0.1',
        dialect: 'mysql'
      }
    }, undefined, 2) + '\n';
  },

  writeDefaultConfig () {
    const configPath = path.dirname(api.getConfigFile());

    if (!helpers.path.existsSync(configPath)) {
      helpers.asset.mkdirp(configPath);
    }

    fs.writeFileSync(api.getConfigFile(), api.getDefaultConfig());
  },

  readConfig () {
    if (!api.config) {
      const env = helpers.generic.getEnvironment();

      if (api.rawConfig === undefined) {
        throw new Error(
          'Error reading "' +
            api.relativeConfigFile() +
            '". Error: ' + api.error
        );
      }

      if (typeof api.rawConfig !== 'object') {
        throw new Error(
          'Config must be an object or a promise for an object: ' +
            api.relativeConfigFile()
        );
      }

      if (args.url) {
        helpers.view.log('Parsed url ' + api.filteredUrl(args.url, api.rawConfig));
      } else {
        helpers.view.log('Loaded configuration file "' + api.relativeConfigFile() + '".');
      }

      if (api.rawConfig[env]) {
        helpers.view.log('Using environment "' + env + '".');

        api.rawConfig = api.rawConfig[env];
      }

      // The Sequelize library needs a function passed in to its logging option
      if (api.rawConfig.logging && !_.isFunction(api.rawConfig.logging)) {
        api.rawConfig.logging = console.log;
      }

      // in case url is present - we overwrite the configuration
      if (api.rawConfig.url) {
        api.rawConfig = _.merge(api.rawConfig, api.parseDbUrl(api.rawConfig.url));
      } else if (api.rawConfig.use_env_variable) {
        api.rawConfig = _.merge(
          api.rawConfig,
          api.parseDbUrl(process.env[api.rawConfig.use_env_variable])
        );
      }

      api.config = api.rawConfig;
    }
    return api.config;
  },

  filteredUrl (uri, config) {
    const regExp = new RegExp(':?' + (config.password || '') + '@');
    return uri.replace(regExp, ':*****@');
  },

  urlStringToConfigHash (urlString) {
    try {
      const urlParts = url.parse(urlString);
      let result   = {
        database: urlParts.pathname.replace(/^\//,  ''),
        host:     urlParts.hostname,
        port:     urlParts.port,
        protocol: urlParts.protocol.replace(/:$/, ''),
        ssl:      urlParts.query ? urlParts.query.indexOf('ssl=true') >= 0 : false
      };

      if (urlParts.auth) {
        result = _.assign(result, {
          username: urlParts.auth.split(':')[0],
          password: urlParts.auth.split(':')[1]
        });
      }

      return result;
    } catch (e) {
      throw new Error('Error parsing url: ' + urlString);
    }
  },

  parseDbUrl (urlString) {
    let config = api.urlStringToConfigHash(urlString);

    config = _.assign(config, {
      dialect: config.protocol
    });

    if (config.dialect === 'sqlite' && config.database.indexOf(':memory') !== 0) {
      config = _.assign(config, {
        storage: '/' + config.database
      });
    }

    return config;
  }
};

module.exports = api;
