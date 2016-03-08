'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(<%= configFile %>)[env];
var db        = {};

if (config.use_env_variable) {
  var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

function readModels(dir) {
  if(!fs.lstatsync(dir).isDirectory()) {
    return;
  }
    fs.readdirSync(dir)
      .filter(function (file) {
        return file !== basename;
      })
      .forEach(function (file) {
        var tmpPath = path.join(dir, file);
        if ((fs.lstatSync(tmpPath).isDirectory() === false) && (tmpPath.slice(-3) === '.js')) {
          var model = sequelize['import'](tmpPath);
          db[model.name] = model;
        } else {
          init_db(tmpPath);
        }
      });
}

readModels(__dirname);

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
