

const _        = require('lodash');
const beautify = require('js-beautify');
const helpers  = require(__dirname);

module.exports = {
  getCoffeeConverter () {
    return helpers.path.resolve('js2coffee') || (function () {
      console.log('Unable to find \'js2coffee\'. Please add it to your project.');
      process.exit(1);
    })();
  },

  render (path, locals, options) {
    options = _.assign({
      beautify: true,
      indent_size: 2,
      preserve_newlines: false
    }, options || {});

    const template = helpers.asset.read(path);
    let content  = _.template(template)(locals || {});

    if (options.beautify) {
      content = beautify(content, options);
    }

    if (helpers.config.supportsCoffee()) {
      content = this.getCoffeeConverter().build(content);
      content = content.code || content;
    }

    return content;
  }
};
