var path    = require('path')
  , helpers = require(path.resolve(__dirname, '..', 'helpers'))
  , args        = require('yargs').argv

module.exports = {
  "version": {
    descriptions: {
      short: "Prints the version number.",
      long: [ "Prints the version number." ]
    },

    task: function() {
      helpers.teaser()
      helpers.log(helpers.getOrmVersion())
    },

    aliases: [ 'v' ]
  }
}
