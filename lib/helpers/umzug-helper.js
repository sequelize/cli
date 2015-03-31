'use strict';

var path    = require('path');
var _       = require('lodash');
var helpers = require(__dirname);

module.exports = {
  getStorageOption: function (property, fallback) {
    return helpers.config.readConfig()[property] || fallback;
  },

  getStorage: function (type) {
    var storage = 'migrationStorage';

    if ( type === 'seeders' ) {
      storage = 'seederStorage';
    }

    return this.getStorageOption(storage, 'sequelize');
  },

  getStoragePath: function (type) {
    var fallbackPath = path.join(process.cwd(), 'sequelize-meta.json');

    var storagePath = 'migrationStoragePath';

    if ( type === 'seeders' ) {
      storagePath = 'seederStoragePath';
    }

    return this.getStorageOption(storagePath, fallbackPath);
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
