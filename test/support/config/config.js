'use strict';

module.exports = {
  username: process.env.SEQ_USER || 'root',
  password: process.env.SEQ_PW || null,
  database: process.env.SEQ_DB || 'sequelize_test',
  host: process.env.SEQ_HOST || '127.0.0.1',
  pool: {
    maxConnections: process.env.SEQ_POOL_MAX || 5,
    maxIdleTime: process.env.SEQ_POOL_IDLE || 30000,
  },

  rand: function () {
    return parseInt(Math.random() * 999, 10);
  },

  // Make maxIdleTime small so that tests exit promptly
  mysql: {
    database:
      process.env.SEQ_MYSQL_DB || process.env.SEQ_DB || 'sequelize_test',
    username: process.env.SEQ_MYSQL_USER || process.env.SEQ_USER || 'root',
    password: process.env.SEQ_MYSQL_PW || process.env.SEQ_PW || null,
    host: process.env.SEQ_MYSQL_HOST || process.env.SEQ_HOST || '127.0.0.1',
    port: process.env.SEQ_MYSQL_PORT || process.env.SEQ_PORT || 3306,
    pool: {
      maxConnections:
        process.env.SEQ_MYSQL_POOL_MAX || process.env.SEQ_POOL_MAX || 5,
      maxIdleTime:
        process.env.SEQ_MYSQL_POOL_IDLE || process.env.SEQ_POOL_IDLE || 3000,
    },
  },

  sqlite: {},

  postgres: {
    database: process.env.SEQ_PG_DB || process.env.SEQ_DB || 'sequelize_test',
    username: process.env.SEQ_PG_USER || process.env.SEQ_USER || 'postgres',
    password: process.env.SEQ_PG_PW || process.env.SEQ_PW || 'postgres',
    host: process.env.SEQ_PG_HOST || process.env.SEQ_HOST || '127.0.0.1',
    port: process.env.SEQ_PG_PORT || process.env.SEQ_PORT || 5432,
    pool: {
      maxConnections:
        process.env.SEQ_PG_POOL_MAX || process.env.SEQ_POOL_MAX || 5,
      maxIdleTime:
        process.env.SEQ_PG_POOL_IDLE || process.env.SEQ_POOL_IDLE || 3000,
    },
  },

  mariadb: {
    database:
      process.env.SEQ_MYSQL_DB || process.env.SEQ_DB || 'sequelize_test',
    username: process.env.SEQ_MYSQL_USER || process.env.SEQ_USER || 'root',
    password: process.env.SEQ_MYSQL_PW || process.env.SEQ_PW || null,
    host: process.env.SEQ_MYSQL_HOST || process.env.SEQ_HOST || '127.0.0.1',
    port: process.env.SEQ_MYSQL_PORT || process.env.SEQ_PORT || 3306,
    pool: {
      maxConnections:
        process.env.SEQ_MYSQL_POOL_MAX || process.env.SEQ_POOL_MAX || 5,
      maxIdleTime:
        process.env.SEQ_MYSQL_POOL_IDLE || process.env.SEQ_POOL_IDLE || 3000,
    },
  },

  db2: {
    database:
      process.env.SEQ_DB2_DB ||
      process.env.SEQ_DB ||
      process.env.IBM_DB_DBNAME ||
      'testdb',
    username:
      process.env.SEQ_DB2_USER ||
      process.env.SEQ_USER ||
      process.env.IBM_DB_UID ||
      'db2inst1',
    password:
      process.env.SEQ_DB2_PW ||
      process.env.SEQ_PW ||
      process.env.IBM_DB_PWD ||
      'password',
    host:
      process.env.DB2_PORT_50000_TCP_ADDR ||
      process.env.SEQ_DB2_HOST ||
      process.env.SEQ_HOST ||
      process.env.IBM_DB_HOSTNAME ||
      '127.0.0.1',
    port:
      process.env.DB2_PORT_50000_TCP_PORT ||
      process.env.SEQ_DB2_PORT ||
      process.env.SEQ_PORT ||
      process.env.IBM_DB_PORT ||
      50000,
    pool: {
      maxConnections:
        process.env.SEQ_DB2_POOL_MAX || process.env.SEQ_POOL_MAX || 5,
      maxIdleTime:
        process.env.SEQ_DB2_POOL_IDLE || process.env.SEQ_POOL_IDLE || 3000,
    },
  },
};
