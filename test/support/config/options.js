'use strict';

const path = require('path');

module.exports = {
  'config': path.resolve('config', 'database.json'),
  'migrations-path': path.resolve('db', 'migrate')
};
