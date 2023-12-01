import _ from 'lodash';
import beautify from 'js-beautify';
import { helpers } from './index';

interface RenderOptions {
  beautify?: boolean;
  indent_size?: number;
  preserve_newlines?: boolean;
}

export function render(
  path: string,
  locals: any,
  options?: RenderOptions
): string {
  options = _.assign(
    {
      beautify: true,
      indent_size: 2,
      preserve_newlines: false,
    },
    options || {}
  );

  const template: string = helpers.asset.read(path);
  let content: string = _.template(template)(locals || {});

  if (options.beautify) {
    content = beautify(content, options);
  }

  return content;
}
