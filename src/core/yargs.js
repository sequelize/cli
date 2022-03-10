import fs from 'fs';
import yargs from 'yargs';
import path from 'path';

function loadRCFile(optionsPath) {
  const SEQUELIZERC = '.sequelizerc';
  const SEQUELIZERC_EXTS = ['', '.json', '.js'];

  const rc = [
    optionsPath || SEQUELIZERC,
    ...SEQUELIZERC_EXTS.map((ext) => SEQUELIZERC + ext),
  ]
    .map((it) => it && path.resolve(it))
    .find((it) => fs.existsSync(it));

  return rc ? JSON.parse(JSON.stringify(require(rc))) : {};
}

const args = yargs
  .help(false)
  .version(false)
  .config(loadRCFile(yargs.argv.optionsPath));

export default function getYArgs() {
  return args;
}

export function _baseOptions(yargs) {
  return yargs
    .option('env', {
      describe: 'The environment to run the command in',
      default: 'development',
      type: 'string',
    })
    .option('config', {
      describe: 'The path to the config file',
      type: 'string',
    })
    .option('options-path', {
      describe: 'The path to a JSON file with additional options',
      type: 'string',
    })
    .option('migrations-path', {
      describe: 'The path to the migrations folder',
      default: 'migrations',
      type: 'string',
    })
    .option('seeders-path', {
      describe: 'The path to the seeders folder',
      default: 'seeders',
      type: 'string',
    })
    .option('models-path', {
      describe: 'The path to the models folder',
      default: 'models',
      type: 'string',
    })
    .option('url', {
      describe:
        'The database connection string to use. Alternative to using --config files',
      type: 'string',
    })
    .option('debug', {
      describe: 'When available show various debug information',
      default: false,
      type: 'boolean',
    });
}

export function _underscoreOption(yargs) {
  return yargs.option('underscored', {
    describe: "Use snake case for the timestamp's attribute names",
    default: false,
    type: 'boolean',
  });
}
