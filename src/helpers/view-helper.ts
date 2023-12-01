import clc from 'cli-color';
import { helpers } from './index';
import getYArgs from '../core/yargs';
import process from 'process';

const args: any = getYArgs().argv;

export const viewHelper = {
  teaser(): void {
    const versions: string[] = [
      'Node: ' + helpers.version.getNodeVersion(),
      'CLI: ' + helpers.version.getCliVersion(),
      'ORM: ' + helpers.version.getOrmVersion(),
    ];

    this.log();
    this.log(clc.underline('Sequelize CLI [' + versions.join(', ') + ']'));
    this.log();
  },

  log(...args: any[]): void {
    console.log.apply(this, args);
  },

  error(error: any): void {
    let message: Error | string | undefined = error;
    const extraMessages: string[] = [];

    if (error instanceof Error) {
      message = !args.debug ? error.message : error.stack;
    }

    if (args.debug && error.original) {
      extraMessages.push(error.original.message);
    }

    this.log();
    console.error(`${clc.red('ERROR:')} ${message}`);
    if (error.original && error.original.detail) {
      console.error(`${clc.red('ERROR DETAIL:')} ${error.original.detail}`);
    }

    extraMessages.forEach((message) =>
      console.error(`${clc.red('EXTRA MESSAGE:')} ${message}`)
    );
    this.log();

    process.exit(1);
  },

  warn(message: string): void {
    this.log(`${clc.yellow('WARNING:')} ${message}`);
  },

  notifyAboutExistingFile(file: string): void {
    this.error(
      'The file ' +
        clc.blueBright(file) +
        ' already exists. ' +
        'Run command with --force to overwrite it.'
    );
  },
};
