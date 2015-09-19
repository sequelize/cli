'use strict';

var fs        = require('fs');
var path      = require('path');
var helpers   = require(__dirname + '/../../lib/helpers');
var Sequelize = helpers.generic.getSequelize();
var _         = Sequelize.Utils._;
var DataTypes = Sequelize;
var Config    = require(__dirname + '/config/config');
var expect    = require('expect.js');
var execQuery = require('../../lib/helpers').generic.execQuery;

var Support = {
  Sequelize: Sequelize,

  initTests: function (options) {
    var sequelize = this.createSequelizeInstance(options);

    this.clearDatabase(sequelize, function () {
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

  prepareTransactionTest: function (sequelize, callback) {
    var dialect = Support.getTestDialect();

    if (dialect === 'sqlite') {
      var options    = Sequelize.Utils._.extend({}, sequelize.options, {
        storage: path.join(__dirname, 'tmp', 'db.sqlite')
      });
      var _sequelize = new Sequelize(sequelize.config.datase, null, null, options);

      _sequelize.sync({ force: true }).then(function () {
        callback(_sequelize);
      });
    } else {
      callback(sequelize);
    }
  },

  createSequelizeInstance: function (options) {
    options = options || {};
    options.dialect = options.dialect || 'mysql';

    var config = Config[options.dialect];
    var sequelizeOptions = _.defaults(options, {
      host:           options.host || config.host,
      logging:        false,
      dialect:        options.dialect,
      port:           options.port || process.env.SEQ_PORT || config.port,
      pool:           config.pool,
      dialectOptions: options.dialectOptions || {}
    });

    if (process.env.DIALECT === 'postgres-native') {
      sequelizeOptions.native = true;
    }

    if (!!config.storage) {
      sequelizeOptions.storage = config.storage;
    }

    return this.getSequelizeInstance(
      config.database,
      config.username,
      config.password,
      sequelizeOptions
    );
  },

  getSequelizeInstance: function (db, user, pass, options) {
    options = options || {};
    options.dialect = options.dialect || this.getTestDialect();
    return new Sequelize(db, user, pass, options);
  },

  clearDatabase: function (sequelize, callback) {
    sequelize
      .getQueryInterface()
      .dropAllTables()
      .then(function () {
        if (sequelize.daoFactoryManager) {
          sequelize.daoFactoryManager.daos = [];
        } else {
          sequelize.modelManager.models = [];
        }

        sequelize
          .getQueryInterface()
          .dropAllEnums()
            .then(callback)
            .catch(function (err) {
              console.log('Error in support.clearDatabase() dropAllEnums() :: ', err);
            });
      })
      .catch(function (err) {
        console.log('Error in support.clearDatabase() dropAllTables() :: ', err);
      });
  },

  getSupportedDialects: function () {
    var dir = __dirname + '/../../node_modules/sequelize/lib/dialects';

    return fs.readdirSync(dir).filter(function (file) {
      return ((file.indexOf('.js') === -1) && (file.indexOf('abstract') === -1));
    });
  },

  checkMatchForDialects: function (dialect, value, expectations) {
    if (!!expectations[dialect]) {
      expect(value).to.match(expectations[dialect]);
    } else {
      throw new Error('Undefined expectation for \'' + dialect + '\'!');
    }
  },

  getTestDialect: function () {
    var envDialect = process.env.DIALECT || 'mysql';

    if (envDialect === 'postgres-native') {
      envDialect = 'postgres';
    }

    if (this.getSupportedDialects().indexOf(envDialect) === -1) {
      throw new Error('The dialect you have passed is unknown. Did you really mean: ' + envDialect);
    }

    return envDialect;
  },

  dialectIsMySQL: function (strict) {
    var envDialect = process.env.DIALECT || 'mysql';

    if (strict === undefined) {
      strict = false;
    }

    if (strict) {
      return envDialect === 'mysql';
    } else {
      return ['mysql', 'mariadb'].indexOf(envDialect) !== -1;
    }
  },

  getTestDialectTeaser: function (moduleName) {
    var dialect = this.getTestDialect();

    if (process.env.DIALECT === 'postgres-native') {
      dialect = 'postgres-native';
    }

    return '[' + dialect.toUpperCase() + '] bin/sequelize ' + moduleName;
  },

  getTestUrl: function (config) {
    var url      = null;
    var dbConfig = config[config.dialect];

    if (config.dialect === 'sqlite') {
      url = 'sqlite://' + dbConfig.storage;
    } else {
      var credentials = dbConfig.username;

      if (dbConfig.password) {
        credentials += ':' + dbConfig.password;
      }

      url = config.dialect + '://' + credentials + '@' + dbConfig.host +
        ':' + dbConfig.port + '/' + dbConfig.database;
    }

    return url;
  },

  getCliPath: function (cwd) {
    return path.resolve(cwd, path.resolve(process.cwd(), 'bin', 'sequelize'));
  },

  getCliCommand: function (cwd, flags) {
    return this.getCliPath(cwd) + ' ' + flags;
  },

  getSupportDirectoryPath: function () {
    return path.resolve(__dirname);
  },

  resolveSupportPath: function () {
    var args = [].slice.apply(arguments);

    args = [this.getSupportDirectoryPath()].concat(args);
    return path.resolve.apply(path, args);
  }
};

var sequelize = Support.createSequelizeInstance({ dialect: Support.getTestDialect() });

// For Postgres' HSTORE functionality and to properly execute it's commands we'll need this...
before(function (done) {
  var dialect = Support.getTestDialect();

  if (dialect !== 'postgres' && dialect !== 'postgres-native') {
    return done();
  }

  execQuery(sequelize, 'CREATE EXTENSION IF NOT EXISTS hstore', {raw: true}).then(function () {
    done();
  });
});

beforeEach(function (done) {
  Support.clearDatabase(sequelize, function () {
    if (sequelize.options.dialect === 'sqlite') {
      var options = sequelize.options;

      options.storage = Support.resolveSupportPath('tmp', 'test.sqlite');
      sequelize = new Support.Sequelize('', '', '', options);
    }

    this.sequelize = sequelize;

    done();
  }.bind(this));
});

module.exports = Support;
