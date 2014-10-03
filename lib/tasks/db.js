"use strict";

var path      = require("path");
var helpers   = require(path.resolve(__dirname, "..", "helpers"));
var args      = require("yargs").argv;
var _         = require("lodash");
var Sequelize = helpers.generic.getSequelize();

var logMigrator = function(s) {
  if (s.indexOf("Executing") !== 0) {
    helpers.view.log(s);
  }
};

var getSequelizeInstance = function() {
  var config  = null;
  var options = {};

  try {
    config = helpers.config.readConfig();
  } catch(e) {
    console.log(e.message);
    process.exit(1);
  }

  _.each(config, function(value, key) {
    if (["database", "username", "password"].indexOf(key) === -1) {
      options[key] = value;
    }

    if (key === "use_env_variable") {
      if (process.env[value]) {
        var db_info = process.env[value].match(/([^:]+):\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

        config.database = db_info[6];
        config.username = db_info[2];
        config.password = db_info[3];

        options = _.extend(options, {
          host: db_info[4],
          port: db_info[5],
          dialect: db_info[1],
          protocol: db_info[1]
        });
      }
    }
  });

  options = _.extend({ logging: logMigrator }, options);
  return new Sequelize(config.database, config.username, config.password, options);
};

var getMigrator = function(callback) {
  if (helpers.config.configFileExists() || args.url) {
    var sequelize       = getSequelizeInstance();
    var migratorOptions = { path: helpers.path.getMigrationsPath() };

    if (helpers.config.supportsCoffee()) {
      migratorOptions = _.merge(migratorOptions, { filesFilter: /\.js$|\.coffee$/ });
    }

    var migrator = sequelize.getMigrator(migratorOptions);

    sequelize
      .authenticate()
      .success(function() {
        callback(migrator, migratorOptions);
      })
      .error(function (err) {
        console.error("Unable to connect to database: " + err);
      });
  } else {
    console.log(
      "Cannot find '" + helpers.config.getConfigFile() +
      "'. Have you run 'sequelize init'?"
    );
    process.exit(1);
  }
};

module.exports = {
  "db:migrate": {
    descriptions: {
      "short": "Run pending migrations.",
      "long": [
        "The command runs every not yet executed migration."
      ]
    },

    task: function() {
      getMigrator(function(migrator) {
        migrator.migrate().success(function() {
          process.exit(0);
        });
      });
    }
  },

  "db:migrate:undo": {
    descriptions: {
      "short": "Revert the last migration run."
    },

    task: function() {
      getMigrator(function(migrator, migratorOptions) {
        migrator.findOrCreateSequelizeMetaDAO().success(function(Meta) {
          Meta.find({ order: "id DESC" }).success(function(meta) {
            if (meta) {
              migrator = migrator.sequelize.getMigrator(
                _.extend(migratorOptions, meta.values), true
              );
              migrator.migrate({ method: "down" }).success(function() {
                process.exit(0);
              });
            } else {
              console.log("There are no pending migrations.");
              process.exit(0);
            }
          });
        });
      });
    }
  }
};
