'use strict';

var path    = require('path');
var _       = require('lodash');
var helpers = require(__dirname);

var storageTableName = {
  migration: 'SequelizeMeta',
  seeder: 'SequelizeData'
};
var storageJsonName = {
  migration: 'sequelize-meta.json',
  seeder: 'sequelize-data.json'
};

module.exports = {
  getStorageOption: function (property, fallback) {
    return helpers.config.readConfig()[property] || fallback;
  },

  getStorage: function (type) {
    return this.getStorageOption(type + 'Storage', 'sequelize');
  },

  getStoragePath: function (type) {
    var fallbackPath = path.join(process.cwd(), storageJsonName[type]);

    return this.getStorageOption(type + 'StoragePath', fallbackPath);
  },

  getTableName: function (type) {
    return this.getStorageOption(type + 'StorageTableName', storageTableName[type]);
  },

  getStorageOptions: function (type, extraOptions) {
    var options = {};

    if (this.getStorage(type) === 'json') {
      options.path = this.getStoragePath(type);
    } else {
      options.tableName = this.getTableName(type);
    }

    _.assign(options, extraOptions);

    return options;
  }
};
