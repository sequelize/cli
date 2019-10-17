'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('../core/yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const resolve = require('resolve').sync;


const args = (0, _yargs2.default)().argv;

const generic = {
  getEnvironment: () => {
    return args.env || process.env.NODE_ENV || 'development';
  },

  getSequelize: file => {
    const resolvePath = file ? _path2.default.join('sequelize', file) : 'sequelize';
    const resolveOptions = { basedir: process.cwd() };

    let sequelizePath;

    try {
      sequelizePath = require.resolve(resolvePath, resolveOptions);
    } catch (e) {}

    try {
      sequelizePath = sequelizePath || resolve(resolvePath, resolveOptions);
    } catch (e) {
      console.error('Unable to resolve sequelize package in ' + process.cwd());
      process.exit(1);
    }

    return require(sequelizePath);
  },

  execQuery: (sequelize, sql, options) => {
    if (sequelize.query.length === 2) {
      return sequelize.query(sql, options);
    } else {
      return sequelize.query(sql, null, options);
    }
  }
};

module.exports = generic;
module.exports.default = generic;