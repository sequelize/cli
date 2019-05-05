'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(
      migration.createTable('trigger_test', {
        name: DataTypes.STRING,
        // eslint-disable-next-line camelcase
        updated_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
          allowNull: false
        }
      }),
      done
    );
  },

  down(migration, DataTypes, done) {
    nodeify(migration.dropTable('trigger_test'), done);
  }
};
