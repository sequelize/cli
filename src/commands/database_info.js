import process from 'process';
import { _baseOptions } from '../core/yargs';

import helpers from '../helpers';
import { pick } from 'lodash';
import clc from 'cli-color';

exports.builder = (yargs) => {
  _baseOptions(yargs)
    .option('show-password', {
      describe: 'Will show password as plain text',
      type: 'boolean',
      default: false,
    })
    .option('raw', {
      describe: 'Display the raw object',
      type: 'boolean',
      default: false,
    }).argv;
};

exports.handler = async function (args) {
  const command = args._[0];

  // legacy, gulp used to do this
  await helpers.config.init();

  const options = pick(args, ['showPassword', 'raw']);

  switch (command) {
    case 'db:info':
      displayConfigObject(options);
      break;
  }

  process.exit(0);
};

function displayConfigObject(options) {
  let config = null;

  try {
    config = helpers.config.readConfig();
  } catch (e) {
    helpers.view.error(e);
  }

  if (!options.showPassword) {
    config.password = '***';
  }

  helpers.view.log();
  helpers.view.log(clc.bold('Sequelize configuration:'));

  options.raw
    ? helpers.view.log(JSON.stringify(config, null, 2))
    : display(config);
}

function display(i, p = '') {
  Object.entries(i).forEach(([k, v]) => {
    if (typeof v == 'object' && v !== null) display(v, `${p}${k}.`);
    else helpers.view.log(`${p}${k}:`, v);
  });
}
