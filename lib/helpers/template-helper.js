'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  render(path, locals, options) {
    options = _lodash2.default.assign({
      beautify: true,
      indent_size: 2,
      preserve_newlines: false
    }, options || {});

    const template = _index2.default.asset.read(path);
    let content = _lodash2.default.template(template)(locals || {});

    if (options.beautify) {
      content = (0, _jsBeautify2.default)(content, options);
    }

    return content;
  }
};