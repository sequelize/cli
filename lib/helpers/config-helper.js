'use strict';

var args    = require('yargs').argv;
var path    = require('path');
var fs      = require('fs');
var helpers = require(__dirname);
var url     = require('url');
var _       = require('lodash');

module.exports = {
  getConfigFile: function () {
    if (args.config) {
      return path.resolve(process.cwd(), args.config);
    }

    var defaultPath = path.resolve(process.cwd(), 'config', 'config.json');
    var alternativePath = defaultPath.replace('.json', '.js');

    return helpers.path.existsSync(alternativePath) ? alternativePath : defaultPath;
  },

  relativeConfigFile: function () {
    return path.relative(process.cwd(), this.getConfigFile());
  },

  configFileExists: function () {
    return helpers.path.existsSync(this.getConfigFile());
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
    var configPath = path.dirname(this.getConfigFile());

    if (!helpers.path.existsSync(configPath)) {
      fs.mkdirSync(configPath);
    }

    fs.writeFileSync(this.getConfigFile(), this.getDefaultConfig());
  },

  readConfig: function (options) {
    var env = helpers.generic.getEnvironment();

    options = _.assign({
      logging: true
    }, options || {});

    if (!this.config) {
      if (args.url) {
        this.config = this.parseDbUrl(args.url);
      } else {
        try {
          this.config = require(this.getConfigFile());
        } catch (e) {
          throw new Error('Error reading "' + this.relativeConfigFile() + '". Error: ' + e.message);
        }
      }

      if (typeof this.config !== 'object') {
        throw new Error('Config must be an object: ' + this.relativeConfigFile());
      }

      if (options.logging) {
        if (args.url) {
          console.log('Parsed url ' + this.filteredUrl(args.url));
        } else {
          console.log('Loaded configuration file "' + this.relativeConfigFile() + '".');
        }
      }

      if (this.config[env]) {
        if (options.logging) {
          console.log('Using environment "' + env + '".');
        }

        // The Sequelize library needs a function passed in to its logging option
        if (this.config.logging && !_.isFunction(this.config.logging)) {
          this.config.logging = console.log;
        }

        this.config = this.config[env];
      }

      // in case url is present - we overwrite the configuration
      if (this.config.url) {
        this.config = _.merge(this.config, this.parseDbUrl(this.config.url));
      }
    }

    return this.config;
  },

  filteredUrl: function (url) {
    var regExp = new RegExp(':?' + (this.config.password || '') + '@');

    return url.replace(regExp, ':*****@');
  },

  supportsCoffee: function (options) {
    var config = null;

    options = _.assign({
      ignoreConfig: true
    }, options || {});

    try {
      config = this.readConfig();
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
    var config = this.urlStringToConfigHash(urlString);

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
