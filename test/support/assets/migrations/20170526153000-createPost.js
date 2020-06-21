'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration.createTable('Post', {
      title: DataTypes.STRING,
      body: DataTypes.TEXT,
    });
  },

  down: function (migration) {
    return migration.dropTable('Post');
  },
};
