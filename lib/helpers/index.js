'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {};

_fs2.default.readdirSync(__dirname).filter(file => file.indexOf('.') !== 0 && file.indexOf('index.js') === -1).forEach(file => {
  module.exports[file.replace('-helper.js', '')] = require(_path2.default.resolve(__dirname, file));
});

module.exports.default = module.exports;