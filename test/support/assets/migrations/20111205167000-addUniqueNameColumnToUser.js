'use strict';

module.exports = {
  up: async function (migration, DataTypes) {
    await migration.addColumn('User', 'uniqueName', { type: DataTypes.STRING });
    await migration.changeColumn('User', 'uniqueName', {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async function (migration) {
    await migration.removeColumn('User', 'uniqueName');
  },
};
