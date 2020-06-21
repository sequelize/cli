'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration.changeColumn('User', 'signature', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Signature',
    });
  },

  down: function () {},
};
