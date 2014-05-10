var path        = require('path')
  , packageJson = require(path.resolve(__dirname, '..', '..', 'package.json'))

module.exports = {
  getCliVersion: function() {
    return packageJson.version
  },

  getOrmVersion: function() {
    return require('sequelize/package.json').version
  },

  getDialectVersion: function() {
    return null
  },

  getDialectName: function() {
    return null
  }
}
