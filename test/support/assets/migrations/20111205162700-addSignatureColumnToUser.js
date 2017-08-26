'use strict';

module.exports = {
  up: function (migration, DataTypes, done) {
    migration
      .addColumn('User', 'isAdmin', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      })
      .done(function (err) {
        if (err) {
          done(err);
        } else {
          migration
            .addColumn('User', 'signature', DataTypes.TEXT)
            .done(function (err) {
              if (err) {
                done(err);
              } else {
                migration.addColumn('User', 'shopId', {
                  type: DataTypes.INTEGER,
                  allowNull: true
                }).done(function () {
                  done();
                });
              }
            });
        }
      });
  },

  down: function (migration, DataTypes, done) {
    migration.removeColumn('User', 'signature').done(function (err) {
      if (err) {
        done(err);
      } else {
        migration.removeColumn('User', 'shopId').done(function (err) {
          if (err) {
            done(err);
          } else {
            migration.removeColumn('User', 'isAdmin').done(function () {
              done();
            });
          }
        });
      }
    });
  }
};
