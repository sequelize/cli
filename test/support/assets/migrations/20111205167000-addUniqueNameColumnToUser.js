'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration.addColumn(
      'User',
      'uniqueName',
      { type: DataTypes.STRING }
    ).complete(function () {
      migration.changeColumn('User', 'uniqueName', {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      });
    });
  },

  down: function (migration) {
    return migration.removeColumn('User', 'uniqueName');
  }
};
