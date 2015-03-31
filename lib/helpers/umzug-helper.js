'use strict';

var path    = require('path');
var _       = require('lodash');
var helpers = require(__dirname);

module.exports = {
  getStorageOption: function (property, fallback) {
    return helpers.config.readConfig()[property] || fallback;
  },

  getStorage: function (type) {
    return this.getStorageOption(type + 'Storage', 'sequelize');
  },

  getStoragePath: function (type) {
    var fallbackPath = path.join(process.cwd(), 'sequelize-meta.json');

    return this.getStorageOption(type + 'StoragePath', fallbackPath);
  },

  getTableName: function () {
    return this.getStorageOption('migrationStorageTableName', 'SequelizeMeta');
  },

  getStorageOptions: function (type, extraOptions) {
    var options = {};

    if (this.getStorage(type) === 'json') {
      options.path = this.getStoragePath(type);
    } else {
      options.tableName = this.getTableName();
    }

    _.assign(options, extraOptions);

    return options;
  }
};
