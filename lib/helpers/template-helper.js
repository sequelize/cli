"use strict";

var helpers   = require(__dirname);
var beautify  = require("js-beautify");
var js2coffee = require("js2coffee");
var _         = require("lodash");

module.exports = {
  render: function (path, locals, options) {
    options = _.extend({
      beautify: true,
      indent_size: 2,
      preserve_newlines: false
    }, options || {});

    var template = helpers.asset.read(path);
    var content  = _.template(template, locals || {});

    if (options.beautify) {
      content = beautify(content, options);
    }

    if (helpers.config.supportsCoffee()) {
      content = js2coffee.build(content);
    }

    return content;
  }
};
