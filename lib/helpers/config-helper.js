var args    = require('yargs').argv
  , path    = require('path')
  , fs      = require('fs')
  , helpers = require(__dirname)

module.exports = {
  getConfigFile: function() {
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
    var config = null
      , env    = helpers.generic.getEnvironment()

    if (args.url) {
      config = parseDbUrl(args.url)
    } else {
      try {
        config = require(this.getConfigFile())
      } catch(e) {
        throw new Error('Error reading "' + this.relativeConfigFile() + '".')
      }
    }

    if (typeof config != 'object') {
      throw new Error('Config must be an object: ' + this.relativeConfigFile());
    }

    if (args.url) {
      console.log('Parsed url ' + args.url);
    } else {
      console.log('Loaded configuration file "' + this.relativeConfigFile() + '".');
    }

    if (config[env]) {
      console.log('Using environment "' + env + '".')
      config = config[env]
    }

    return config
  },

  supportsCoffee: function() {
    var config = this.readConfig()
    return args.coffee || config.coffee
  }
}
