import _ from 'lodash';
import beautify from 'js-beautify';
import helpers from './index';

module.exports = {
  render(path, locals, options) {
    options = Object.assign({
      beautify: true,
      // eslint-disable-next-line camelcase
      indent_size: 2,
      // eslint-disable-next-line camelcase
      preserve_newlines: false
    }, options || {});

    const template = helpers.asset.read(path);
    let content  = _.template(template)(locals || {});

    if (options.beautify) {
      content = beautify(content, options);
    }

    return content;
  }
};
