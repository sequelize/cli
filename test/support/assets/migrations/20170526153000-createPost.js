'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration
      .createTable('Post', {
        title: DataTypes.STRING,
        body: DataTypes.TEXT
      }), done);
  },

  down(migration, DataTypes, done) {
    nodeify(migration.dropTable('Post'), done);
  }
};
