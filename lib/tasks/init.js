var path    = require('path')
  , fs      = require('fs')
  , helpers = require(path.resolve(__dirname, '..', 'helpers'))
  , args    = require('yargs').argv

var getConfigFile = function() {
  return path.resolve(process.cwd(), 'config', 'config.json')
}

var relativeConfigFile = function() {
  return path.relative(process.cwd(), getConfigFile())
}

var configFileExists = function() {
  return fs.existsSync(getConfigFile())
}

var writeDefaultConfig = function() {
  var configPath = path.dirname(getConfigFile())
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

  fs.writeFileSync(getConfigFile(), config)
}

var createMigrationsFolder = function(force) {
  var migrationsPath = args.migrationsPath || path.resolve(process.cwd(), 'migrations')

  if (force) {
    console.log('Deleting the migrations folder. (--force)')

    try {
      fs.readdirSync(migrationsPath).forEach(function(filename) {
        fs.unlinkSync(migrationsPath + '/' + filename)
      })
    } catch(e) {}
    try {
      fs.rmdirSync(migrationsPath)
      console.log('Successfully deleted the migrations folder.')
    } catch(e) {}
  }

  try {
    mkdirp(migrationsPath)
    console.log('Successfully created migrations folder at "' + migrationsPath + '".')
  } catch(e) {
  }
}

var mkdirp = function (path, root) {
  var dirs = path.split('/')
    , dir  = dirs.shift()
    , root = (root || '') + dir + '/'

  try {
    fs.mkdirSync(root)
  } catch (e) {
    // dir wasn't made, something went wrong
    if (!fs.statSync(root).isDirectory()) {
      throw new Error(e)
    }
  }

  return !dirs.length || mkdirp(dirs.join('/'), root)
}

module.exports = {
  "init": {
    descriptions: {
      short: "Initializes the project. Options: --force",
      long: [
        "The command will initialize the current directory. The result",
        "will be a 'config' as well as a 'migration' folder. Furthermore",
        "'config/config.json' will be generated.",
      ],
      options: {
        "--force": "Will drop the existing config folder and re-create it.",
        "--migrations-path": "The path to the migrations folder."
      }
    },

    task: function() {
      if (!configFileExists() || !!args.force) {
        writeDefaultConfig()

        console.log('Created "' + relativeConfigFile() + '"')
      } else {
        console.log('The file "' + relativeConfigFile() + '" already exists. Run "sequelize --init --force" to overwrite it.')
        process.exit(1)
      }

      createMigrationsFolder(!!args.force)
    }
  }
}
