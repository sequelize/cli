'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _yargs = require('../core/yargs');

var _yargs2 = _interopRequireDefault(_yargs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const resolve = require('resolve').sync;


const args = (0, _yargs2.default)().argv;

function format(i) {
  return parseInt(i, 10) < 10 ? '0' + i : i;
};

function getCurrentYYYYMMDDHHmms() {
  const date = new Date();
  return [date.getUTCFullYear(), format(date.getUTCMonth() + 1), format(date.getUTCDate()), format(date.getUTCHours()), format(date.getUTCMinutes()), format(date.getUTCSeconds())].join('');
}

module.exports = {
  getPath(type) {
    type = type + 's';

    let result = args[type + 'Path'] || _path2.default.resolve(process.cwd(), type);

    if (_path2.default.normalize(result) !== _path2.default.resolve(result)) {
      // the path is relative
      result = _path2.default.resolve(process.cwd(), result);
    }

    return result;
  },

  getFileName(type, name, options) {
    return this.addFileExtension([getCurrentYYYYMMDDHHmms(), name ? name : 'unnamed-' + type].join('-'), options);
  },

  getFileExtension() {
    return 'js';
  },

  addFileExtension(basename, options) {
    return [basename, this.getFileExtension(options)].join('.');
  },

  getMigrationPath(migrationName) {
    return _path2.default.resolve(this.getPath('migration'), this.getFileName('migration', migrationName));
  },

  getSeederPath(seederName) {
    return _path2.default.resolve(this.getPath('seeder'), this.getFileName('seeder', seederName));
  },

  getModelsPath() {
    return args.modelsPath || _path2.default.resolve(process.cwd(), 'models');
  },

  getModelPath(modelName) {
    return _path2.default.resolve(this.getModelsPath(), this.addFileExtension(modelName.toLowerCase()));
  },

  resolve(packageName) {
    let result;

    try {
      result = resolve(packageName, { basedir: process.cwd() });
      result = require(result);
    } catch (e) {
      try {
        result = require(packageName);
      } catch (err) {}
    }

    return result;
  },

  existsSync(pathToCheck) {
    if (_fs2.default.accessSync) {
      try {
        _fs2.default.accessSync(pathToCheck, _fs2.default.R_OK);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return _fs2.default.existsSync(pathToCheck);
    }
  }
};