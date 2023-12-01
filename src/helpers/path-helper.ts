import path from 'path';
import fs, { constants } from 'fs';
import resolve from 'resolve';
import getYArgs from '../core/yargs';

const args: any = getYArgs().argv;

export function format(i: any): string {
  return parseInt(i, 10) < 10 ? '0' + i : i.toString();
}

export function getCurrentYYYYMMDDHHmms(): string {
  const date = new Date();
  return [
    date.getUTCFullYear(),
    format(date.getUTCMonth() + 1),
    format(date.getUTCDate()),
    format(date.getUTCHours()),
    format(date.getUTCMinutes()),
    format(date.getUTCSeconds()),
  ].join('');
}

export const pathHelper = {
  getPath(type: string): string {
    type = type + 's';

    let result = args[type + 'Path'] || path.resolve(process.cwd(), type);

    if (path.normalize(result) !== path.resolve(result)) {
      // the path is relative
      result = path.resolve(process.cwd(), result);
    }

    return result;
  },

  getFileName(type: string, name: string, options?: any): string {
    return this.addFileExtension(
      [getCurrentYYYYMMDDHHmms(), name ? name : 'unnamed-' + type].join('-'),
      options
    );
  },

  getFileExtension(): string {
    return 'js';
  },

  addFileExtension(basename: string): string {
    return [basename, this.getFileExtension()].join('.');
  },

  getMigrationPath(migrationName: string): string {
    return path.resolve(
      this.getPath('migration'),
      this.getFileName('migration', migrationName)
    );
  },

  getSeederPath(seederName: string): string {
    return path.resolve(
      this.getPath('seeder'),
      this.getFileName('seeder', seederName)
    );
  },

  getModelsPath(): string {
    return args.modelsPath || path.resolve(process.cwd(), 'models');
  },

  getModelPath(modelName: string): string {
    return path.resolve(
      this.getModelsPath(),
      this.addFileExtension(modelName.toLowerCase())
    );
  },

  resolve(packageName: string): any {
    let result: any;

    try {
      result = resolve(
        packageName,
        { basedir: process.cwd() },
        (err, resolve) => {
          result = resolve;
        }
      );
      result = require(result);
    } catch (e) {
      try {
        result = require(packageName);
      } catch (err) {
        // ignore error
      }
    }

    return result;
  },

  existsSync(pathToCheck: string): boolean {
    if (fs.accessSync) {
      try {
        fs.accessSync(pathToCheck, constants.R_OK);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return fs.existsSync(pathToCheck);
    }
  },
};
