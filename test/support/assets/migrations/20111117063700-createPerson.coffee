module.exports =
  up: (migration, DataTypes) ->
    migration
      .createTable 'Person',
        name: DataTypes.STRING
        isBetaMember:
          type: DataTypes.BOOLEAN
          defaultValue: false
          allowNull: false
  down: (migration, DataTypes) ->
    migration
      .dropTable 'Person'
