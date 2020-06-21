'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration.createTable('trigger_test', {
      name: DataTypes.STRING,
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    });
  },

  down: function (migration) {
    return migration.dropTable('trigger_test');
  },
};
