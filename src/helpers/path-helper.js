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

  getFullFilename(type, name, { mode, action }) {
    const filename = this.getFileName(type, name);
    return this.addFileExtension(
      mode && action ? `${filename}.${action}` : filename,
      mode
    );
  },
  getFileName (type, name) {
    return  [
      getCurrentYYYYMMDDHHmms(),
      name ? name : 'unnamed-' + type
    ].join('-');
  },

  getFileExtension(fileExtension) {
    if (fileExtension) return fileExtension
    return 'js';
  },

  addFileExtension (basename, options) {
    return [basename, this.getFileExtension(options)].join('.');
  },

  getMigrationPath (migrationName, migrationMode) {
    return path.resolve(this.getPath('migration'), this.getFullFilename('migration', migrationName, migrationMode));
  },

  getSeederPath (seederName) {
    return path.resolve(this.getPath('seeder'), this.getFullFilename('seeder', seederName));
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
