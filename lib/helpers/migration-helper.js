var helpers   = require(__dirname)
  , _         = require('lodash')
  , _s        = require('underscore.string')
  , Sequelize = require('sequelize')
  , sequelize = new Sequelize()

module.exports = {
  getTableName: function(modelName) {
    return sequelize.define(modelName, {}).tableName
  },

  generateFileContent: function(args) {
    var migrationContent = helpers.asset.read('migrations/migration.js').split("\n")
      , tableName        = this.getTableName(args.name)
      , attributes       = helpers.model.transformAttributes(args.attributes)

    migrationContent = migrationContent.reduce(function(acc, line) {
      if (_.includes(line, '//')) {
        return acc
      } else if (_.includes(line, 'done()')) {
        return acc
      } else if (_.includes(line, 'up:')) {
        return acc.concat([
          line,
          "    migration",
          "      .createTable('" + tableName + "', {",
        ]).concat(
          _.map(attributes, function(value, key) {
            return ("        " + key + ": DataTypes." + value.toUpperCase())
          })
        ).concat([
          "      })",
          "      .complete(done)"
        ])
      } else if (_.includes(line, 'down:')) {
        return acc.concat([
          line,
          "    migration",
          "      .dropTable('" + tableName + "')",
          "      .complete(done)"
        ])
      } else {
        return acc.concat([line])
      }
    }, [])

    return migrationContent.join("\n")
  },

  generateMigrationName: function(args) {
    return _s.ltrim(_s.dasherize("create-" + args.name), '-')
  },

  generateFile: function(args) {
    var migrationName = this.generateMigrationName(args)
      , migrationPath = helpers.path.getMigrationPath(migrationName)

    helpers.asset.write(migrationPath, this.generateFileContent(args))
  }
}
