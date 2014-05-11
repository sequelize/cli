var path    = require('path')
  , helpers = require(path.resolve(__dirname, '..', 'helpers'))
  , args    = require('yargs').argv
  , moment  = require('moment')
  , fs      = require('fs')

module.exports = {
  "migration:create": {
    descriptions: {
      short: "Generates a new migration file.",
      options: {
        "--name": "Defines the name of the migration. Default: unnamed-migration",
        "--coffee" : "If enabled, the generated migration file will use coffee script. Default: false"
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

      var migrationContent   = ""
        , migrationExtension = helpers.config.supportsCoffee() ? '.coffee' : '.js'
        , migrationName      = [
            moment().format('YYYYMMDDHHmmss'),
            !!args.name ? args.name : 'unnamed-migration'
          ].join('-') + migrationExtension

      if (helpers.config.supportsCoffee()) {
        migrationContent = [
          "module.exports = ",
          "  up: (migration, DataTypes, done) ->",
          "    # add altering commands here, calling 'done' when finished",
          "    done()",
          "",
          "  down: (migration, DataTypes, done) ->",
          "    # add reverting commands here, calling 'done' when finished",
          "    done()"
        ].join('\n') + "\n"
      } else {
        migrationContent = [
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


      fs.writeFileSync(helpers.migration.getMigrationsPath() + '/' + migrationName, migrationContent)

      console.log(
        'New migration "' + migrationName + '" was added to "' +
        path.relative(process.cwd(), helpers.migration.getMigrationsPath()) + '/".'
      )
    }
  }
}
