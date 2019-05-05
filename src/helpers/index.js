'use strict';

const path = require('path');
const fs = require('fs');

module.exports = {};

fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && !file.includes('index.js'))
  .forEach(file => {
    module.exports[file.replace('-helper.js', '')] = require(path.resolve(__dirname, file));
  });

module.exports.default = module.exports;
