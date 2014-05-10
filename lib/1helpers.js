var path        = require('path')
  , packageJson = require(path.resolve(__dirname, '..', 'package.json'))
  , args        = require('yargs').argv
  , fs          = require('fs')

var helpers = module.exports = {
  configFileExists: function() {

  },

  addTask: function(gulp, taskName, task) {
    gulp.task(
      taskName,
      task.descriptions.short,
      task.dependencies || [],
      function() {
        helpers.teaser()
        task.task()
      }, {
        aliases: task.aliases || []
      }
    )
  },

  addHelp:function(gulp, taskName, task) {
    gulp.task(
      "help:" + taskName,
      "Prints the detailed help for " + taskName + ".",
      function() {
        helpers.teaser()

        helpers.log("Help for " + taskName)
        helpers.log()

        if (task.descriptions.long) {
          task.descriptions.long.forEach(function(line) { helpers.log(line) })
        } else {
          helpers.log(task.descriptions.short)
        }

        (function(options) {
          if (options) {
            var margin = Object.keys(options).reduce(function(m, option) {
              return (m > option.length) ? m : option.length;
            }, 0);

            helpers.log()
            helpers.log('Options for ' + taskName)
            helpers.log()
          }

          Object.keys(options || {}).forEach(function(option) {
            var args = [option]
            args.push(new Array(margin - option.length + 1).join(" "))
            args.push(options[option])
            helpers.log.apply(helpers, args);
          })
        })(task.descriptions.options)
      }
    )
  },

  getConfigFile = function() {
    return path.resolve(process.cwd(), 'config', 'config.json')
  },

  createMigrationsFolder: function(force) {
    var migrationsPath = args.migrationsPath || path.resolve(process.cwd(), 'migrations')

    if (force) {
      console.log('Deleting the migrations folder. (--force)')

      try {
        fs.readdirSync(migrationsPath).forEach(function(filename) {
          fs.unlinkSync(migrationsPath + '/' + filename)
        })
      } catch(e) {
        console.log(e)
      }
      try {
        fs.rmdirSync(migrationsPath)
        console.log('Successfully deleted the migrations folder.')
      } catch(e) {
        console.log(e)
      }
    }

    try {
      this.mkdirp(migrationsPath)
      console.log('Successfully created migrations folder at "' + migrationsPath + '".')
    } catch(e) {
      console.log(e)
    }
  },

  mkdirp: function (path, root) {
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

    return !dirs.length || this.mkdirp(dirs.join('/'), root)
  },

  readConfig: function() {
    var config

    if (args.url) {
      config = parseDbUrl(args.url);
    } else {
      try {
        config = require(configuration.configFile);
      } catch(e) {
        throw new Error('Error reading "' + relativeConfigFile() + '".')
      }
    }

    if (typeof config != 'object') {
      throw new Error('Config must be an object: ' + relativeConfigFile());
    }

    if (program.url) {
      console.log('Parsed url ' + program.url);
    } else {
      console.log('Loaded configuration file "' + relativeConfigFile() + '".');
    }

    if (config[configuration.environment]) {
      console.log('Using environment "' + configuration.environment + '".')
      config = config[configuration.environment]
    }

    supportsCoffee = program.coffee || config.coffee

    return config
  }
}
