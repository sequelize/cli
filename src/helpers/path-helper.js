import path from 'path';
import fs from 'fs';

const resolve = require('resolve').sync;
import getYArgs from '../core/yargs';

const args = getYArgs().argv;

function format (i) {
  return parseInt(i, 10) < 10 ? '0' + i : i;
};

function getCurrentYYYYMMDDHHmms () {
  const date = new Date();
  return [
    date.getUTCFullYear(),
    format(date.getUTCMonth() + 1),
    format(date.getUTCDate()),
    format(date.getUTCHours()),
    format(date.getUTCMinutes()),
    format(date.getUTCSeconds())
  ].join('');
}

function getUnixTimestampMillis () {
  return Date.now();
}

function getUnixTimestamp () {
  return Math.round(Date.now() / 1000);
}

function getFormattedDate (timestampOption) {
  switch (timestampOption) {
    case 'dateYYYYMMDDHHmms':
      return getCurrentYYYYMMDDHHmms();
    case 'unix-timestamp':
      return getUnixTimestamp();
    case 'unix-timestamp-millis':
      return getUnixTimestampMillis ();
    default:
      return getCurrentYYYYMMDDHHmms();
  }
}

module.exports = {
  getPath (type) {
    type = type + 's';

    let result = args[type + 'Path'] || path.resolve(process.cwd(), type);

    if (path.normalize(result) !== path.resolve(result)) {
      // the path is relative
      result = path.resolve(process.cwd(), result);
    }

    return result;
  },

  getFileName (type, options) {
    return this.addFileExtension(
      [
        getFormattedDate(options.filenameDateFormat),
        options.name ? options.name : 'unnamed-' + type
      ].join('-'),
      options
    );
  },

  getFileExtension () {
    return 'js';
  },

  addFileExtension (basename, options) {
    return [basename, this.getFileExtension(options)].join('.');
  },

  getMigrationPath (options) {
    return path.resolve(this.getPath('migration'), this.getFileName('migration', options));
  },

  getSeederPath (seederName) {
    return path.resolve(this.getPath('seeder'), this.getFileName('seeder', seederName));
  },

  getModelsPath () {
    return args.modelsPath || path.resolve(process.cwd(), 'models');
  },

  getModelPath (modelName) {
    return path.resolve(
      this.getModelsPath(),
      this.addFileExtension(modelName.toLowerCase())
    );
  },

  resolve (packageName) {
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

  existsSync (pathToCheck) {
    if (fs.accessSync) {
      try {
        fs.accessSync(pathToCheck, fs.R_OK);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return fs.existsSync(pathToCheck);
    }
  }
};
