'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(<%= configFile %>)[env];
const models = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => !file.startsWith('.') && file !== basename && file.endsWith('.js'))
  .forEach(file => {
    const model = require(file);
    models[model.name] = model;
  });

for (const model of Object.values(models)) {
  model.setup(models);
}
for (const model of Object.values(models)) {
  if (model.associate) {
    model.associate(models);
  }
}

exports.sequelize = sequelize;
exports.models = models;
