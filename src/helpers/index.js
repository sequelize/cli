

const path = require('path');
const fs   = require('fs');

module.exports = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && file.indexOf('index.js') === -1;
  })
  .forEach(file => {
    module.exports[file.replace('-helper.js', '')] = require(path.resolve(__dirname, file));
  });
