import path from 'path';
import _ from 'lodash';
import { helpers } from './index';

interface Storage {
  migration: string;
  seeder: string;
}

interface StorageTableName {
  migration: string;
  seeder: string;
}

interface StorageJsonName {
  migration: string;
  seeder: string;
}

let timestampsDefault: boolean = false;

const storage: Storage = {
  migration: 'sequelize',
  seeder: 'none',
};

const storageTableName: StorageTableName = {
  migration: 'SequelizeMeta',
  seeder: 'SequelizeData',
};

const storageJsonName: StorageJsonName = {
  migration: 'sequelize-meta.json',
  seeder: 'sequelize-data.json',
};

export const umzugHelper = {
  getStorageOption(property: string, fallback: any) {
    return helpers.config.readConfig()[property] || fallback;
  },

  getStorage(type: string) {
    return this.getStorageOption(type + 'Storage', storage[type]);
  },

  getStoragePath(type: string) {
    const fallbackPath = path.join(process.cwd(), storageJsonName[type]);

    return this.getStorageOption(type + 'StoragePath', fallbackPath);
  },

  getTableName(type: string) {
    return this.getStorageOption(
      type + 'StorageTableName',
      storageTableName[type]
    );
  },

  getSchema(type?: string) {
    return this.getStorageOption(type + 'StorageTableSchema', undefined);
  },

  enableTimestamps() {
    timestampsDefault = true;
  },

  getTimestamps(type: string) {
    return this.getStorageOption(type + 'Timestamps', timestampsDefault);
  },

  getStorageOptions(type: string, extraOptions: any) {
    const options: any = {};

    if (this.getStorage(type) === 'json') {
      options.path = this.getStoragePath(type);
    } else if (this.getStorage(type) === 'sequelize') {
      options.tableName = this.getTableName(type);
      options.schema = this.getSchema(type);
      options.timestamps = this.getTimestamps(type);
    }

    _.assign(options, extraOptions);

    return options;
  },
};
