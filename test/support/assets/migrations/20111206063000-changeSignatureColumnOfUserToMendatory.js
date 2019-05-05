'use strict';

const nodeify = require('nodeify');

module.exports = {
  up(migration, DataTypes, done) {
    nodeify(migration.changeColumn('User', 'signature', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Signature'
    }), done);
  },

  down(migration, DataTypes, done) {
    done();
  }
};
