import { blueBright, red, underline, yellow } from 'ansis';
import _ from 'lodash';
import helpers from './index';
import getYArgs from '../core/yargs';
import process from 'process';

const args = getYArgs().argv;

module.exports = {
  teaser() {
    const versions = [
      'Node: ' + helpers.version.getNodeVersion(),
      'CLI: ' + helpers.version.getCliVersion(),
      'ORM: ' + helpers.version.getOrmVersion(),
    ];

    this.log();
    this.log(underline('Sequelize CLI [' + versions.join(', ') + ']'));
    this.log();
  },

  log() {
    console.log.apply(this, arguments);
  },

  error(error) {
    let message = error;
    const extraMessages = [];

    if (error instanceof Error) {
      message = !args.debug ? error.message : error.stack;
    }

    if (args.debug && error.original) {
      extraMessages.push(error.original.message);
    }

    this.log();
    console.error(`${red`ERROR:`} ${message}`);
    if (error.original && error.original.detail) {
      console.error(`${red`ERROR DETAIL:`} ${error.original.detail}`);
    }

    extraMessages.forEach((message) =>
      console.error(`${red`EXTRA MESSAGE:`} ${message}`)
    );
    this.log();

    process.exit(1);
  },

  warn(message) {
    this.log(`${yellow`WARNING:`} ${message}`);
  },

  notifyAboutExistingFile(file) {
    this.error(
      'The file ' +
        blueBright(file) +
        ' already exists. ' +
        'Run command with --force to overwrite it.'
    );
  },

  pad(s, smth) {
    let margin = smth;

    if (_.isObject(margin)) {
      margin = Object.keys(margin);
    }

    if (Array.isArray(margin)) {
      margin = Math.max.apply(
        null,
        margin.map((o) => {
          return o.length;
        })
      );
    }

    return s + new Array(margin - s.length + 1).join(' ');
  },
};
