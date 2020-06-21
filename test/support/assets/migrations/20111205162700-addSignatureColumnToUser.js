'use strict';

module.exports = {
  up: async function (migration, DataTypes) {
    await migration.addColumn('User', 'isAdmin', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    await migration.addColumn('User', 'signature', DataTypes.TEXT);
    await migration.addColumn('User', 'shopId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  },

  down: async function (migration) {
    await migration.removeColumn('User', 'signature');
    await migration.removeColumn('User', 'shopId');
    await migration.removeColumn('User', 'isAdmin');
  },
};
