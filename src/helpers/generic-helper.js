'use strict';

const path = require('path');

const { getYArgs } = require('../core/yargs');

const args = getYArgs().argv;

const generic = {
  getEnvironment: () => {
    return args.env || process.env.NODE_ENV || 'development';
  },

  getSequelize: file => {
    const resolvePath = file ? path.join('sequelize', file) : 'sequelize';
    const resolveOptions = { paths: [process.cwd()] };

    let sequelizePath;

    try {
      sequelizePath = require.resolve(resolvePath, resolveOptions);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`Unable to resolve sequelize package in ${process.cwd()}`);
      process.exit(1);
    }

    return require(sequelizePath);
  },

  execQuery: (sequelize, sql, options) => {
    if (sequelize.query.length === 2) {
      return sequelize.query(sql, options);
    }
    return sequelize.query(sql, null, options);

  }
};

module.exports = generic;
module.exports.default = generic;
