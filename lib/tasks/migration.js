var path    = require('path')
  , helpers = require(path.resolve(__dirname, '..', 'helpers'))
  , args    = require('yargs').argv
  , moment  = require('moment')
  , fs      = require('fs')
  , clc     = require('cli-color')

var getJsSkeleton = function() {
  return [
    "module.exports = {",
    "  up: function(migration, DataTypes, done) {",
    "    // add altering commands here, calling 'done' when finished",
    "    done()",
    "  },",
    "  down: function(migration, DataTypes, done) {",
    "    // add reverting commands here, calling 'done' when finished",
    "    done()",
    "  }",
    "}"
  ].join('\n') + "\n"
}

var getCoffeeSkeleton = function() {
  return [
    "module.exports = ",
    "  up: (migration, DataTypes, done) ->",
    "    # add altering commands here, calling 'done' when finished",
    "    done()",
    "",
    "  down: (migration, DataTypes, done) ->",
    "    # add reverting commands here, calling 'done' when finished",
    "    done()"
  ].join('\n') + "\n"
}

var getSkeleton = function() {
  if (helpers.config.supportsCoffee()) {
    return getCoffeeSkeleton()
  } else {
    return getJsSkeleton()
  }
}

module.exports = {
  "migration:create": {
    descriptions: {
      short: "Generates a new migration file.",
      options: {
        "--name": "Defines the name of the migration. " + clc.blueBright("Default: unnamed-migration")
      }
    },

    aliases: [ 'migration:generate' ],

    task: function() {
      var config = null

      helpers.migration.createMigrationsFolder()

      try {
        config = helpers.config.readConfig()
      } catch(e) {
        console.log(e.message)
        process.exit(1)
      }

      var migrationExtension = helpers.config.supportsCoffee() ? '.coffee' : '.js'
        , migrationName      = [
            moment().format('YYYYMMDDHHmmss'),
            !!args.name ? args.name : 'unnamed-migration'
          ].join('-') + migrationExtension

      fs.writeFileSync(helpers.migration.getMigrationsPath() + '/' + migrationName, getSkeleton())

      console.log(
        'New migration "' + migrationName + '" was added to "' +
        path.relative(process.cwd(), helpers.migration.getMigrationsPath()) + '/".'
      )
    }
  }
}
