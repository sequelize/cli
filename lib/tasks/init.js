var path    = require('path')
  , helpers = require(path.resolve(__dirname, '..', 'helpers'))
  , args        = require('yargs').argv

module.exports = {
  "init": {
    descriptions: {
      short: "Initializes the project. Options: --force",
      long: [
        "The command will initialize the current directory. The result",
        "will be a 'config' as well as a 'migration' folder. Furthermore",
        "'config/config.json' will be generated."
      ]
    },

    task: function() {
      helpers.teaser()
    }
  }
}
