module.exports =
  up: (migration, DataTypes) ->
    return migration
      .bulkInsert 'Person', [
        name: 'John Doe'
        isBetaMember: false ],
        name: {}
        isBetaMember: {}
  down: (migration, DataTypes) ->
    migration
      .bulkDelete 'Person',
        null,
        {}
