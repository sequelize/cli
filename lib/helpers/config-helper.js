'use strict';

var args     = require('yargs').argv;
var Bluebird = require('bluebird');
var path     = require('path');
var fs       = require('fs');
var helpers  = require(__dirname);
var url      = require('url');
var _        = require('lodash');

var api = {
  config: undefined,
  rawConfig: undefined,
  error: undefined,
  init: function () {
    return Bluebird.resolve()
      .then(function () {
        var config;

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
      .then(function (config) {
        if (typeof config === 'object' || config === undefined) {
          return config;
        } else if (config.length === 1) {
          return Bluebird.promisify(config)();
        } else {
          return config();
        }
      })
      .then(function (config) {
        api.rawConfig = config;
      })
      .then(function () {
        // Always return the full config api
        return api;
      });
  },
  getConfigFile: function () {
    if (args.config) {
      return path.resolve(process.cwd(), args.config);
    }

    var defaultPath = path.resolve(process.cwd(), 'config', 'config.json');
    var alternativePath = defaultPath.replace('.json', '.js');

    return helpers.path.existsSync(alternativePath) ? alternativePath : defaultPath;
  },

  relativeConfigFile: function () {
    return path.relative(process.cwd(), api.getConfigFile());
  },

  configFileExists: function () {
    return helpers.path.existsSync(api.getConfigFile());
  },

  getDefaultConfig: function () {
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

  writeDefaultConfig: function () {
    var configPath = path.dirname(api.getConfigFile());

    if (!helpers.path.existsSync(configPath)) {
      fs.mkdirSync(configPath);
    }

    fs.writeFileSync(api.getConfigFile(), api.getDefaultConfig());
  },

  readConfig: function () {
    if (!api.config) {
      var env = helpers.generic.getEnvironment();

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
        console.log('Parsed url ' + api.filteredUrl(args.url, api.rawConfig));
      } else {
        console.log('Loaded configuration file "' + api.relativeConfigFile() + '".');
      }

      if (api.rawConfig[env]) {
        console.log('Using environment "' + env + '".');

        // The Sequelize library needs a function passed in to its logging option
        if (api.rawConfig.logging && !_.isFunction(api.rawConfig.logging)) {
          api.rawConfig.logging = console.log;
        }

        api.rawConfig = api.rawConfig[env];
      }

      // in case url is present - we overwrite the configuration
      if (api.rawConfig.url) {
        api.rawConfig = _.merge(api.rawConfig, api.parseDbUrl(api.rawConfig.url));
      }

      api.config = api.rawConfig;
    }
    return api.config;
  },

  filteredUrl: function (url, config) {
    var regExp = new RegExp(':?' + (config.password || '') + '@');

    return url.replace(regExp, ':*****@');
  },

  supportsCoffee: function (options) {
    var config = null;

    options = _.assign({
      ignoreConfig: true
    }, options || {});

    try {
      config = api.readConfig();
    } catch (e) {
      if (options.ignoreConfig) {
        config = {};
      } else {
        throw e;
      }
    }

    return args.coffee || config.coffee;
  },

  urlStringToConfigHash: function (urlString) {
    try {
      var urlParts = url.parse(urlString);
      var result   = {
        database: urlParts.path.replace(/^\//,  ''),
        dialect:  urlParts.protocol,
        host:     urlParts.hostname,
        port:     urlParts.port
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

  parseDbUrl: function (urlString) {
    var config = api.urlStringToConfigHash(urlString);

    config = _.assign(config, {
      dialect: config.dialect.replace(/:$/, '')
    });

    if (config.dialect === 'sqlite') {
      config = _.assign(config, {
        storage: '/' + config.database
      });
    }

    return config;
  }
};

module.exports = api;
