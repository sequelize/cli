'use strict';

module.exports = {
  up: function (migration) {
    return migration.removeColumn('User', 'shopId');
  },
  down: function (migration, DataTypes) {
    return migration.addColumn('User', 'shopId', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  },
};
