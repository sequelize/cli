module.exports =
  up: (migration, DataTypes) ->
    return migration
      .createTable 'Person',
        name: DataTypes.STRING
        isBetaMember:
          type: DataTypes.BOOLEAN
          defaultValue: false
          allowNull: false
  down: (migration, DataTypes) ->
    return migration
      .dropTable 'Person'
