

const helpers = require(__dirname);
const args    = require('yargs').argv;
const fs      = require('fs');
const path    = require('path');
const moment  = require('moment');
const resolve = require('resolve').sync;

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

  getFileName (type, name, options) {
    return this.addFileExtension(
      [
        moment().utc().format('YYYYMMDDHHmmss'),
        name ? name : 'unnamed-' + type
      ].join('-'),
      options
    );
  },

  getFileExtension (options) {
    return helpers.config.supportsCoffee(options) ? 'coffee' : 'js';
  },

  addFileExtension (basename, options) {
    return [basename, this.getFileExtension(options)].join('.');
  },

  getMigrationPath (migrationName) {
    return path.resolve(this.getPath('migration'), this.getFileName('migration', migrationName));
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
      } catch (e) {}
    }

    return result;
  },

  existsSync (path) {
    if (fs.accessSync) {
      try {
        fs.accessSync(path, fs.R_OK);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return fs.existsSync(path);
    }
  }
};
