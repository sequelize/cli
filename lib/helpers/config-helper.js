var args    = require('yargs').argv
  , path    = require('path')
  , fs      = require('fs')
  , helpers = require(__dirname)
  , url     = require("url")
  , _       = require('lodash')

module.exports = {
  getConfigFile: function() {
    if (args.config) {
      return path.resolve(process.cwd(), args.config)
    }

    return path.resolve(process.cwd(), 'config', 'config.json')
  },

  relativeConfigFile: function() {
    return path.relative(process.cwd(), this.getConfigFile())
  },

  configFileExists: function() {
    return fs.existsSync(this.getConfigFile())
  },

  writeDefaultConfig: function() {
    var configPath = path.dirname(this.getConfigFile())
    var config = JSON.stringify({
      development: {
        username: "root",
        password: null,
        database: 'database_development',
        host: '127.0.0.1',
        dialect: 'mysql'
      },
      test: {
        username: "root",
        password: null,
        database: 'database_test',
        host: '127.0.0.1',
        dialect: 'mysql'
      },
      production: {
        username: "root",
        password: null,
        database: 'database_production',
        host: '127.0.0.1',
        dialect: 'mysql'
      }
    }, undefined, 2) + "\n"

    if (!fs.existsSync(configPath)) {
      fs.mkdirSync(configPath)
    }

    fs.writeFileSync(this.getConfigFile(), config)
  },

  readConfig: function() {
    var env = helpers.generic.getEnvironment()

    if (!this.config) {
      if (args.url) {
        this.config = this.parseDbUrl(args.url)
      } else {
        try {
          this.config = require(this.getConfigFile())
        } catch(e) {
          throw new Error('Error reading "' + this.relativeConfigFile() + '". Error: ' + e.message)
        }
      }

      if (typeof this.config != 'object') {
        throw new Error('Config must be an object: ' + this.relativeConfigFile());
      }

      if (args.url) {
        console.log('Parsed url ' + args.url);
      } else {
        console.log('Loaded configuration file "' + this.relativeConfigFile() + '".');
      }

      if (this.config[env]) {
        console.log('Using environment "' + env + '".')
        this.config = this.config[env]
      }
    }

    return this.config
  },

  supportsCoffee: function(options) {
    var config = null

    options = _.extend({
      ignoreConfig: false
    }, options || {})

    try {
      config = this.readConfig()
    } catch (e) {
      if (options.ignoreConfig) {
        config = {}
      } else {
        throw e
      }
    }

    return args.coffee || config.coffee
  },

  parseDbUrl: function(urlString) {
    var urlParts
      , config = {}

    try {
      urlParts        = url.parse(urlString)
      config.database = urlParts.path.replace(/^\//,  '');
      config.dialect  = urlParts.protocol;
      config.dialect  = config.dialect.replace(/:$/, '');
      config.host     = urlParts.hostname;
      config.port     = urlParts.port;

      if (config.dialect === 'sqlite') {
        config.storage = '/' + config.database;
      }

      if (urlParts.auth) {
        config.username = urlParts.auth.split(':')[0]
        config.password = urlParts.auth.split(':')[1]
      }
    } catch (e) {
      throw new Error('Error parsing url: ' + url);
    }

    return config
  }
}
