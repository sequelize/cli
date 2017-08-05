#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

import init from '../lib/commands/init';
import migrate from '../lib/commands/migrate';
import migrateUndo from '../lib/commands/migrate_undo';
import seed from '../lib/commands/seed';
import seedOne from '../lib/commands/seed_one';
import migrationCreate from '../lib/commands/migration_create';
import modelCreate from '../lib/commands/model_create';
import seedCreate from '../lib/commands/seed_create';

yargs
  .command('db:migrate', 'Run pending migrations', migrate)
  .command('db:migrate:schema:timestamps:add', 'Update migration table to have timestamps', migrate)
  .command('db:migrate:status', 'List the status of all migrations', migrate)
  .command('db:migrate:undo', 'Reverts a migration', migrateUndo)
  .command('db:migrate:undo:all', 'Revert all migrations ran', migrate)
  .command('db:seed', 'Run specified seeder', seedOne)
  .command('db:seed:undo', 'Deletes data from the database', seedOne)
  .command('db:seed:all', 'Run every seeder', seed)
  .command('db:seed:undo:all', 'Deletes data from the database', seed)
  .command('init', 'Initializes project', init)
  .command('init:config', 'Initializes configuration', init)
  .command('init:migrations', 'Initializes migrations', init)
  .command('init:models', 'Initializes models', init)
  .command('init:seeders', 'Initializes seeders', init)
  .command(['migration:create', 'migration:generate'], 'Generates a new migration file', migrationCreate)
  .command(['model:create', 'model:generate'], 'Generates a model and its migration', modelCreate)
  .command(['seed:create', 'seed:generate'], 'Generates a new seed file', seedCreate)
  .command('version', 'Prints the version number', () => {})
  .config(loadRCFile(yargs.argv.optionsPath))
  .demandCommand()
  .help()
  .argv;


function loadRCFile (optionsPath) {
  const rcFile = optionsPath || path.resolve(process.cwd(), '.sequelizerc');
  return fs.existsSync(rcFile) ? JSON.parse(fs.readFileSync(rcFile)) : {};
};
