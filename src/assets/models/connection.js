'use strict';
import { Sequelize } from 'sequelize';
const env = process.env.NODE_ENV || 'development';
const config = require(<%= configFile %>)[env];

const sequelizeConnection<%= isTypescriptProject ? ': Sequelize' : '' %> = config.config.use_env_variable
  ? new Sequelize( process.env[config.config.use_env_variable], config)
  : new Sequelize(config.database, config.username, config.password, config);

module.exports = sequelizeConnection;
