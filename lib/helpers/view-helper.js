var helpers = require(__dirname)
  , clc     = require('cli-color')

module.exports = {
  teaser: function() {
    var self     = this
    var versions = [
      'CLI: v' + helpers.version.getCliVersion(),
      'ORM: v' + helpers.version.getOrmVersion()
    ]

    if (helpers.version.getDialectName() && helpers.version.getDialectVersion()) {
      versions.push(helpers.version.getDialectVersion + ": v" + helpers.version.getDialectVersion())
    }

    this.log()
    this.log(clc.underline('Sequelize [' + versions.join(", ") + ']'))
    this.log()
  },

  log: console.log
}
