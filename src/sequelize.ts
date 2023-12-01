#!/usr/bin/env node

import getYArgs from './core/yargs';

const yargs = getYArgs();

import init, { initBuilder } from './commands/init';
import migrate, { migrateBuilder } from './commands/migrate';
import migrateUndo, { migrateUndoBuilder } from './commands/migrate_undo';
import migrateUndoAll, {
  migrateUndoAllBuilder,
} from './commands/migrate_undo_all';
import seed, { seedBuilder } from './commands/seed';
import seedOne, { seedOneBuilder } from './commands/seed_one';
import migrationGenerate, {
  migrationGenerateBuilder,
} from './commands/migration_generate';
import modelGenerate, { modelGenerateBuilder } from './commands/model_generate';
import seedGenerate, { seedGenerateBuilder } from './commands/seed_generate';
import database, { databaseBuilder } from './commands/database';

import { helpers } from './helpers/index';

helpers.view.teaser();

yargs
  .help()
  .version()
  .command('db:migrate', 'Run pending migrations', migrateBuilder, migrate)
  .command(
    'db:migrate:schema:timestamps:add',
    'Update migration table to have timestamps',
    migrateBuilder,
    migrate
  )
  .command(
    'db:migrate:status',
    'List the status of all migrations',
    migrateBuilder,
    migrate
  )
  .command(
    'db:migrate:undo',
    'Reverts a migration',
    migrateUndoBuilder,
    migrateUndo
  )
  .command(
    'db:migrate:undo:all',
    'Revert all migrations ran',
    migrateUndoAllBuilder,
    migrateUndoAll
  )
  .command('db:seed', 'Run specified seeder', seedOneBuilder, seedOne)
  .command(
    'db:seed:undo',
    'Deletes data from the database',
    seedOneBuilder,
    seedOne
  )
  .command('db:seed:all', 'Run every seeder', seedBuilder, seed)
  .command(
    'db:seed:undo:all',
    'Deletes data from the database',
    seedBuilder,
    seed
  )
  .command(
    'db:create',
    'Create database specified by configuration',
    databaseBuilder,
    database
  )
  .command(
    'db:drop',
    'Drop database specified by configuration',
    databaseBuilder,
    database
  )
  .command('init', 'Initializes project', initBuilder, init)
  .command('init:config', 'Initializes configuration', initBuilder, init)
  .command('init:migrations', 'Initializes migrations', initBuilder, init)
  .command('init:models', 'Initializes models', initBuilder, init)
  .command('init:seeders', 'Initializes seeders', initBuilder, init)
  .command(
    'migration:generate',
    'Generates a new migration file',
    migrationGenerateBuilder,
    migrationGenerate
  )
  .command(
    'migration:create',
    'Generates a new migration file',
    migrationGenerateBuilder,
    migrationGenerate
  )
  .command(
    'model:generate',
    'Generates a model and its migration',
    modelGenerateBuilder,
    modelGenerate
  )
  .command(
    'model:create',
    'Generates a model and its migration',
    modelGenerateBuilder,
    modelGenerate
  )
  .command(
    'seed:generate',
    'Generates a new seed file',
    seedGenerateBuilder,
    seedGenerate
  )
  .command(
    'seed:create',
    'Generates a new seed file',
    seedGenerateBuilder,
    seedGenerate
  )
  .wrap(yargs.terminalWidth())
  .demandCommand(1, 'Please specify a command')
  .help()
  .strict()
  .recommendCommands().argv;
