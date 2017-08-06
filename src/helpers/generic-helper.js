

const fs   = require('fs');
const args = require('yargs').argv;
const path = require('path');
const resolve = require('resolve').sync;

module.exports = {
  mkdirp (path, root) {
    const dirs = path.split('/');
    const dir  = dirs.shift();

    root = (root || '') + dir + '/';

    try {
      fs.mkdirSync(root);
    } catch (e) {
      // dir wasn't made, something went wrong
      if (!fs.statSync(root).isDirectory()) {
        throw new Error(e);
      }
    }

    return !dirs.length || this.mkdirp(dirs.join('/'), root);
  },

  getEnvironment () {
    return args.env || process.env.NODE_ENV || 'development';
  },

  getSequelize (file) {
    let sequelizePath;
    const resolvePath = file ? path.join('sequelize', file) : 'sequelize';
    const resolveOptions = { basedir: process.cwd() };

    try {
      sequelizePath = require.resolve(resolvePath, resolveOptions);
    } catch (e) {
    }

    try {
      sequelizePath = sequelizePath || resolve(resolvePath, resolveOptions);
    } catch (e) {
      console.error('Unable to resolve sequelize package in ' + process.cwd());
      process.exit(1);
    }

    return require(sequelizePath);
  },

  execQuery (sequelize, sql, options) {
    if (sequelize.query.length === 2) {
      return sequelize.query(sql, options);
    } else {
      return sequelize.query(sql, null, options);
    }
  }
};
