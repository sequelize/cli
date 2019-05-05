'use strict';

module.exports = {
  up(migration, DataTypes, done) {
    migration
      .addColumn('User', 'isAdmin', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      })
      .done(err => {
        if (err) {
          done(err);
        } else {
          migration
            .addColumn('User', 'signature', DataTypes.TEXT)
            .done(err => {
              if (err) {
                done(err);
              } else {
                migration.addColumn('User', 'shopId', {
                  type: DataTypes.INTEGER,
                  allowNull: true
                }).done(() => {
                  done();
                });
              }
            });
        }
      });
  },

  down(migration, DataTypes, done) {
    migration.removeColumn('User', 'signature').done(err => {
      if (err) {
        done(err);
      } else {
        migration.removeColumn('User', 'shopId').done(err => {
          if (err) {
            done(err);
          } else {
            migration.removeColumn('User', 'isAdmin').done(() => {
              done();
            });
          }
        });
      }
    });
  }
};
