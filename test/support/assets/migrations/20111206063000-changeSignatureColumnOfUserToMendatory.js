'use strict';

var nodeify = require('nodeify');

module.exports = {
  up: function (migration, DataTypes, done) {
    nodeify(migration.changeColumn('User', 'signature', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Signature'
    }), done);
  },

  down: function (migration, DataTypes, done) {
    done();
  }
};
