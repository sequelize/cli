'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration.createTable('Person', {
      name: DataTypes.STRING,
      isBetaMember: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    });
  },

  down: function (migration) {
    return migration.dropTable('Person');
  },
};
