'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(
      migration.addColumn('User', 'uniqueName', { type: DataTypes.STRING }),
      () => {
        nodeify(
          migration.changeColumn('User', 'uniqueName', {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
          }),
          done
        );
      }
    );
  },

  down(migration, DataTypes, done) {
    nodeify(migration.removeColumn('User', 'uniqueName'), done);
  }
};
