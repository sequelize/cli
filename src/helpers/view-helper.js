import clc from 'cli-color';
import _ from 'lodash';
import helpers from './index';
import getYArgs from '../core/yargs';

const args = getYArgs().argv;

module.exports = {
  teaser () {
    const versions = [
      'Node: ' + helpers.version.getNodeVersion(),
      'CLI: '  + helpers.version.getCliVersion(),
      'ORM: '  + helpers.version.getOrmVersion()
    ];

    this.log();
    this.log(clc.underline('Sequelize CLI [' + versions.join(', ') + ']'));
    this.log();
  },

  log () {
    console.log.apply(this, arguments);
  },

  error (error) {
    let message = error;

    if (error instanceof Error) {
      message = !args.debug
        ? error.message
        : error.stack;
    }

    this.log();
    console.error(`${clc.red('ERROR:')} ${message}`);
    this.log();

    process.exit(1);
  },

  warn (message) {
    this.log(`${clc.yellow('WARNING:')} ${message}`);
  },

  notifyAboutExistingFile (file) {
    this.error(
      'The file ' + clc.blueBright(file) + ' already exists. ' +
      'Run command with --force to overwrite it.'
    );
  },

  pad (s, smth) {
    let margin = smth;

    if (_.isObject(margin)) {
      margin = Object.keys(margin);
    }

    if (Array.isArray(margin)) {
      margin = Math.max.apply(null, margin.map(o => {
        return o.length;
      }));
    }

    return s + new Array(margin - s.length + 1).join(' ');
  }
};
