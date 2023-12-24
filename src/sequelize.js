#!/usr/bin/env node

import getYArgs from './core/yargs';
import { isTypescriptProject } from './helpers/import-helper';

// enable typescript compatibility if project is based on typescript
if (isTypescriptProject) require('ts-node/register');

const yargs = getYArgs();

import init from './commands/init';
import migrate from './commands/migrate';
import migrateUndo from './commands/migrate_undo';
import migrateUndoAll from './commands/migrate_undo_all';
import seed from './commands/seed';
import seedOne from './commands/seed_one';
import migrationGenerate from './commands/migration_generate';
import modelGenerate from './commands/model_generate';
import seedGenerate from './commands/seed_generate';
import database from './commands/database';

import helpers from './helpers/index';

helpers.view.teaser();

yargs
  .help()
  .version()
  .command('db:migrate', 'Run pending migrations', migrate)
  .command(
    'db:migrate:schema:timestamps:add',
    'Update migration table to have timestamps',
    migrate
  )
  .command('db:migrate:status', 'List the status of all migrations', migrate)
  .command('db:migrate:undo', 'Reverts a migration', migrateUndo)
  .command('db:migrate:undo:all', 'Revert all migrations ran', migrateUndoAll)
  .command('db:seed', 'Run specified seeder', seedOne)
  .command('db:seed:undo', 'Deletes data from the database', seedOne)
  .command('db:seed:all', 'Run every seeder', seed)
  .command('db:seed:undo:all', 'Deletes data from the database', seed)
  .command('db:create', 'Create database specified by configuration', database)
  .command('db:drop', 'Drop database specified by configuration', database)
  .command('init', 'Initializes project', init)
  .command('init:config', 'Initializes configuration', init)
  .command('init:migrations', 'Initializes migrations', init)
  .command('init:models', 'Initializes models', init)
  .command('init:seeders', 'Initializes seeders', init)
  .command(
    'migration:generate',
    'Generates a new migration file',
    migrationGenerate
  )
  .command(
    'migration:create',
    'Generates a new migration file',
    migrationGenerate
  )
  .command(
    'model:generate',
    'Generates a model and its migration',
    modelGenerate
  )
  .command('model:create', 'Generates a model and its migration', modelGenerate)
  .command('seed:generate', 'Generates a new seed file', seedGenerate)
  .command('seed:create', 'Generates a new seed file', seedGenerate)
  .wrap(yargs.terminalWidth())
  .demandCommand(1, 'Please specify a command')
  .help()
  .strict()
  .recommendCommands().argv;
