'use strict';

const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const Bluebird  = require('bluebird');
const DataTypes = Sequelize;
const Config    = require('./config/config');
const expect    = require('expect.js');
const execQuery = function(sequelize, sql, options) {
  if (sequelize.query.length === 2) {
    return sequelize.query(sql, options);
  }
  return sequelize.query(sql, null, options);

};

const Support = {
  Sequelize,

  initTests(options) {
    const sequelize = this.createSequelizeInstance(options);

    this.clearDatabase(sequelize, () => {
      if (options.context) {
        options.context.sequelize = sequelize;
      }

      if (options.beforeComplete) {
        options.beforeComplete(sequelize, DataTypes);
      }

      if (options.onComplete) {
        options.onComplete(sequelize, DataTypes);
      }
    });
  },

  prepareTransactionTest(sequelize, callback) {
    const dialect = Support.getTestDialect();

    if (dialect === 'sqlite') {
      const options    = Object.assign({}, sequelize.options, {
        storage: path.join(__dirname, 'tmp', 'db.sqlite')
      });
      const _sequelize = new Sequelize(sequelize.config.datase, null, null, options);

      _sequelize.sync({ force: true }).then(() => {
        callback(_sequelize);
      });
    } else {
      callback(sequelize);
    }
  },

  createSequelizeInstance(options) {
    options = options || {};
    options.dialect = options.dialect || 'sqlite';

    const config = Config[options.dialect];
    const sequelizeOptions = {
      host: options.host || config.host,
      logging: false,
      dialect: options.dialect,
      port: options.port || process.env.SEQ_PORT || config.port,
      pool: config.pool,
      dialectOptions: options.dialectOptions || {},
      ...options
    };

    if (process.env.DIALECT === 'postgres-native') {
      sequelizeOptions.native = true;
    }

    if (config.storage) {
      sequelizeOptions.storage = config.storage;
    }

    return this.getSequelizeInstance(
      config.database,
      config.username,
      config.password,
      sequelizeOptions
    );
  },

  getSequelizeInstance(db, user, pass, options) {
    options = options || {};
    options.dialect = options.dialect || this.getTestDialect();
    return new Sequelize(db, user, pass, options);
  },

  clearDatabase(sequelize, callback) {
    function dropAllTables() {
      return sequelize
        .getQueryInterface()
        .dropAllTables()
        .then(() => {
          if (sequelize.daoFactoryManager) {
            sequelize.daoFactoryManager.daos = [];
          } else {
            sequelize.modelManager.models = [];
          }

          return sequelize
            .getQueryInterface()
            .dropAllEnums()
            .then(callback)
            .catch(err => {
              // eslint-disable-next-line no-console
              console.log('Error in support.clearDatabase() dropAllEnums() :: ', err);
            });
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.log('Error in support.clearDatabase() dropAllTables() :: ', err);
        });
    }

    // If Postgres, loop through each of the non-public schemas and DROP/re-CREATE them.
    if (this.dialectIsPostgres()) {
      return sequelize
        .showAllSchemas()
        .then(schemas => {
          // showAllSchemas() leaves off the public schema.
          return Bluebird.mapSeries(schemas, schema => {
            return sequelize
              .dropSchema(schema)
              .then(() => {
                return sequelize.createSchema(schema);
              });
          }).then(dropAllTables); // Drop the public schema tables.
        });
    }
    return dropAllTables();

  },

  getSupportedDialects() {
    const dir = path.join(path.dirname(require.resolve('sequelize')), '/lib/dialects');

    return fs.readdirSync(dir).filter(file => {
      return !file.includes('.js') && !file.includes('abstract');
    });
  },

  checkMatchForDialects(dialect, value, expectations) {
    if (expectations[dialect]) {
      expect(value).to.match(expectations[dialect]);
    } else {
      throw new Error(`Undefined expectation for '${dialect  }'!`);
    }
  },

  getTestDialect() {
    let envDialect = process.env.DIALECT || 'sqlite';

    if (envDialect === 'postgres-native') {
      envDialect = 'postgres';
    }

    if (!this.getSupportedDialects().includes(envDialect)) {
      throw new Error(`The dialect you have passed is unknown. Did you really mean: ${envDialect}`);
    }

    return envDialect;
  },

  dialectIsMySQL(strict) {
    const envDialect = this.getTestDialect();

    if (strict === undefined) {
      strict = false;
    }

    if (strict) {
      return envDialect === 'mysql';
    }
    return ['mysql', 'mariadb'].includes(envDialect);

  },

  dialectIsPostgres() {
    const envDialect = this.getTestDialect();
    return ['postgres', 'postgres-native'].includes(envDialect);
  },

  getTestDialectTeaser(moduleName) {
    let dialect = this.getTestDialect();

    if (process.env.DIALECT === 'postgres-native') {
      dialect = 'postgres-native';
    }

    return `[${dialect.toUpperCase()}] src/sequelize ${moduleName}`;
  },

  getTestUrl(config) {
    let url      = null;
    const dbConfig = config[config.dialect];

    if (config.dialect === 'sqlite') {
      url = `sqlite://${dbConfig.storage}`;
    } else {
      let credentials = dbConfig.username;

      if (dbConfig.password) {
        credentials += `:${dbConfig.password}`;
      }

      url = `${config.dialect  }://${credentials  }@${dbConfig.host
      }:${dbConfig.port}/${dbConfig.database}`;
    }

    return url;
  },

  getCliPath(cwd) {
    return path.resolve(cwd, path.resolve(process.cwd(), 'src', 'sequelize'));
  },

  getCliCommand(cwd, flags) {
    return `${this.getCliPath(cwd)  } ${flags}`;
  },

  getSupportDirectoryPath() {
    return path.resolve(__dirname);
  },

  resolveSupportPath() {
    let args = [].slice.apply(arguments);

    args = [this.getSupportDirectoryPath()].concat(args);
    return path.resolve.apply(path, args);
  }
};

let sequelize = Support.createSequelizeInstance({ dialect: Support.getTestDialect() });

// For Postgres' HSTORE functionality and to properly execute it's commands we'll need this...
before(done => {
  const dialect = Support.getTestDialect();

  if (dialect !== 'postgres' && dialect !== 'postgres-native') {
    return done();
  }

  execQuery(sequelize, 'CREATE EXTENSION IF NOT EXISTS hstore', { raw: true }).then(() => {
    done();
  });
});

beforeEach(function(done) {
  Support.clearDatabase(sequelize, () => {
    if (sequelize.options.dialect === 'sqlite') {
      const options = sequelize.options;

      options.storage = Support.resolveSupportPath('tmp', 'test.sqlite');
      sequelize = new Support.Sequelize('', '', '', options);
    }

    this.sequelize = sequelize;

    done();
  });
});

module.exports = Support;
