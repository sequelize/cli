'use strict';

const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(module.filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require(<%= configFile %>)[env];

if (config.use_env_variable) {
  const sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  const sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const starting = (setting) => setting.use_env_variable ? 
                              new Sequelize(process.env[setting.use_env_variable]) :
                              new Sequelize(setting.database, setting.username, setting.password, setting)
                              
const isModels = file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
const modelImport = file => sequelize['import'](path.join(__dirname, file))

const model = 
  fs
    .readdirSync(__dirname)
    .filter(file => isModels(file))
    .map(model => modelImport(model))
    .reduce((acc, model) => acc.model, {})

//associate irei terminar a noite

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

module.exports = model;
