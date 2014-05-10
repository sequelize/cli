var path    = require('path')
  , fs      = require('fs')
  , helpers = require(path.resolve(__dirname, '..', 'helpers'))
  , args    = require('yargs').argv

module.exports = {
  "init": {
    descriptions: {
      short: "Initializes the project.",
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
      if (!helpers.config.configFileExists() || !!args.force) {
        helpers.config.writeDefaultConfig()

        console.log('Created "' + helpers.config.relativeConfigFile() + '"')
      } else {
        console.log('The file "' + helpers.config.relativeConfigFile() + '" already exists. Run "sequelize init --force" to overwrite it.')
        process.exit(1)
      }

      helpers.migration.createMigrationsFolder(!!args.force)
    }
  }
}
