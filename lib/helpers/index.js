'use strict';

var path = require('path');
var fs   = require('fs');

module.exports = {};

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file.indexOf('index.js') === -1);
  })
  .forEach(function (file) {
    module.exports[file.replace('-helper.js', '')] = require(path.resolve(__dirname, file));
  });
