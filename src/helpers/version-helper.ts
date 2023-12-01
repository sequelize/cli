import path from 'path';
import { helpers } from './index';

interface VersionHelper {
  getCliVersion(): string;
  getOrmVersion(): string;
  getDialect(): any;
  getDialectName(): string;
  getNodeVersion(): string;
}

const packageJson: Record<string, unknown> = require(
  path.resolve(__dirname, '..', '..', 'package.json')
);

export const versionHelper: VersionHelper = {
  getCliVersion(): string {
    return packageJson.version as string;
  },

  getOrmVersion(): string {
    return helpers.generic.getSequelize('package.json').version;
  },

  getDialect() {
    try {
      return helpers.config.readConfig();
    } catch (e) {
      return null;
    }
  },

  getDialectName() {
    const config = this.getDialect();

    if (config) {
      const databases = {
        sqlite: 'sqlite3',
        postgres: 'pg',
        postgresql: 'pg',
        mariadb: 'mariasql',
        mysql: 'mysql',
      };

      return databases[config.dialect];
    } else {
      return null;
    }
  },

  getNodeVersion(): string {
    return process.version.replace('v', '');
  },
};
