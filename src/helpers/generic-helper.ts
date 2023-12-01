import path from 'path';
import process from 'process';
const resolve = require('resolve').sync;
import getYArgs, { _baseOptions } from '../core/yargs';

const args = _baseOptions(getYArgs()).argv;

export const genericHelper = {
  getEnvironment: () => {
    return args.env || process.env.NODE_ENV || 'development';
  },

  getSequelize: (file?: string) => {
    const resolvePath = file ? path.join('sequelize', file) : 'sequelize';
    const resolveOptions = { basedir: process.cwd() };

    let sequelizePath;

    try {
      sequelizePath = require.resolve(resolvePath, { paths: [process.cwd()] });
    } catch (e) {
      // ignore error
    }

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
      return (sequelize.query as any)(sql, null, options);
    }
  },
};
