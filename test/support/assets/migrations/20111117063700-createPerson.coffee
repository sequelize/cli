nodeify = require 'nodeify'

module.exports =
  up: (migration, DataTypes, done) ->
    nodeify migration.createTable('Person',
      name: DataTypes.STRING
      isBetaMember:
        type: DataTypes.BOOLEAN
        defaultValue: false
        allowNull: false
    ), done
  down: (migration, DataTypes, done) ->
    nodeify migration.dropTable('Person'), done
