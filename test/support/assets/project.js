'use strict';

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    'Project' + parseInt(Math.random() * 9999999999999999n, 10),
    {
      name: DataTypes.STRING,
    }
  );
};
