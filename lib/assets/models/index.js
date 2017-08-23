'use strict';

const fs        = require('fs');
const path      = require('path');
const Sequelize = require('sequelize');
const basename  = path.basename(module.filename);
const env       = process.env.NODE_ENV || 'development';
const config    = require(<%= configFile %>)[env];

const starting = setting => setting.use_env_variable ? 
                              new Sequelize(process.env[setting.use_env_variable]) :
                              new Sequelize(setting.database, setting.username, setting.password, setting)

const sequelize = starting(config)
const isModels = file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
const modelImport = file => sequelize.import(path.join(__dirname, file))

const models = 
  fs
    .readdirSync(__dirname)
    .filter(file => isModels(file))
    .map(model => modelImport(model))
    .reduce((acc, model) => {
      acc[model.name] = model
      return acc
    }, {})

Object.keys(models)
  .map(model => models[model].associate(models))

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
