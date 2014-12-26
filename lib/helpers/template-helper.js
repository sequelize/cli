"use strict";

var _        = require("lodash");
var beautify = require("js-beautify");
var helpers  = require(__dirname);
var resolve  = require("resolve").sync;

module.exports = {
  getCoffeeConverter: function () {
    var converter;

    try {
      converter = require(resolve("js2coffee", { basedir: process.cwd() }));
    } catch (e) {}

    try {
      converter = require("js2coffee");
    } catch (e) {}

    if (converter) {
      return converter;
    } else {
      throw new Error("Unable to find \"js2coffee\". Please add it to your project.");
    }
  },

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
      content = this.getCoffeeConverter().build(content);
    }

    return content;
  }
};
