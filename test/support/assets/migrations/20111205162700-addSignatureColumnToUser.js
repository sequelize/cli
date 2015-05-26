'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration
      .addColumn('User', 'isAdmin', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      })
      .then(function () {
        return migration
          .addColumn('User', 'signature', DataTypes.TEXT)
          .then(function () {
            return migration.addColumn('User', 'shopId', {
              type: DataTypes.INTEGER,
              allowNull: true
            });
          });
      }, function (err) {
        throw Error(err);
      });
  },

  down: function (migration) {
    return migration.removeColumn('User', 'signature').then(function () {
      migration.removeColumn('User', 'shopId').then(function () {
        migration.removeColumn('User', 'isAdmin');
      });
    }, function (err) {
      throw Error(err);
    });
  }
};
