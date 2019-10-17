'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const storage = {
  migration: 'sequelize',
  seeder: 'none'
};
const storageTableName = {
  migration: 'SequelizeMeta',
  seeder: 'SequelizeData'
};
const storageJsonName = {
  migration: 'sequelize-meta.json',
  seeder: 'sequelize-data.json'
};

module.exports = {
  getStorageOption(property, fallback) {
    return _index2.default.config.readConfig()[property] || fallback;
  },

  getStorage(type) {
    return this.getStorageOption(type + 'Storage', storage[type]);
  },

  getStoragePath(type) {
    const fallbackPath = _path2.default.join(process.cwd(), storageJsonName[type]);

    return this.getStorageOption(type + 'StoragePath', fallbackPath);
  },

  getTableName(type) {
    return this.getStorageOption(type + 'StorageTableName', storageTableName[type]);
  },

  getSchema(type) {
    return this.getStorageOption(type + 'StorageTableSchema', undefined);
  },

  getStorageOptions(type, extraOptions) {
    const options = {};

    if (this.getStorage(type) === 'json') {
      options.path = this.getStoragePath(type);
    } else if (this.getStorage(type) === 'sequelize') {
      options.tableName = this.getTableName(type);
      options.schema = this.getSchema(type);
    }

    _lodash2.default.assign(options, extraOptions);

    return options;
  }
};