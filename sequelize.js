#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import cliPackage from '../package';

import init from '../lib/commands/init';
import migrate from '../lib/commands/migrate';
import migrateUndo from '../lib/commands/migrate_undo';
import migrateUndoAll from '../lib/commands/migrate_undo_all';
import seed from '../lib/commands/seed';
import seedOne from '../lib/commands/seed_one';
import migrationGenerate from '../lib/commands/migration_generate';
import modelGenerate from '../lib/commands/model_generate';
import seedGenerate from '../lib/commands/seed_generate';

const cli = yargs
  .command('db:migrate', 'Run pending migrations', migrate)
  .command('db:migrate:schema:timestamps:add', 'Update migration table to have timestamps', migrate)
  .command('db:migrate:status', 'List the status of all migrations', migrate)
  .command('db:migrate:undo', 'Reverts a migration', migrateUndo)
  .command('db:migrate:undo:all', 'Revert all migrations ran', migrateUndoAll)
  .command('db:seed', 'Run specified seeder', seedOne)
  .command('db:seed:undo', 'Deletes data from the database', seedOne)
  .command('db:seed:all', 'Run every seeder', seed)
  .command('db:seed:undo:all', 'Deletes data from the database', seed)
  .command('init', 'Initializes project', init)
  .command('init:config', 'Initializes configuration', init)
  .command('init:migrations', 'Initializes migrations', init)
  .command('init:models', 'Initializes models', init)
  .command('init:seeders', 'Initializes seeders', init)
  .command(['migration:generate', 'migration:create'], 'Generates a new migration file', migrationGenerate)
  .command(['model:generate', 'model:create'], 'Generates a model and its migration', modelGenerate)
  .command(['seed:generate', 'seed:create'], 'Generates a new seed file', seedGenerate)
  .config(loadRCFile(yargs.argv.optionsPath))
  .version(() => cliPackage.version)
  .help();

const args = cli.argv;

// if no command then show help
if (!args._[0]) {
  cli.showHelp();
}

function loadRCFile (optionsPath) {
  const rcFile = optionsPath || path.resolve(process.cwd(), '.sequelizerc');
  const rcFileResolved = path.resolve(rcFile);
  return fs.existsSync(rcFileResolved)
    ? JSON.parse(JSON.stringify(require(rcFileResolved)))
    : {};
};
