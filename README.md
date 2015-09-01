# sequelize/cli [![Build Status](https://travis-ci.org/sequelize/cli.svg?branch=master)](https://travis-ci.org/sequelize/cli) [![Code Climate](https://codeclimate.com/github/sequelize/cli.png)](https://codeclimate.com/github/sequelize/cli)

The Sequelize Command Line Interface (CLI)

## Installation

Install this globally and you'll have access to the `sequelize` command anywhere on your system.

```
npm install -g sequelize-cli
```

or install it locally to your `node_modules` folder

```bash
npm install --save sequelize-cli
```
## Global Install Usage

```
$ sequelize [--HARMONY-FLAGS]
```


```
Sequelize [Node: 2.5.0, CLI: 1.8.3, ORM: 2.1.3]

Usage
  sequelize [task]

Available tasks
  db:migrate             Run pending migrations.
  db:migrate:old_schema  Update legacy migration table
  db:migrate:undo        Revert the last migration run.
  db:migrate:undo:all    Revert all migrations ran.
  db:seed                Run seeders.
  db:seed:undo           Deletes data from the database.
  db:seed:undo:all       Deletes data from the database.
  help                   Display this help text. Aliases: h
  init                   Initializes the project.
  init:config            Initializes the configuration.
  init:migrations        Initializes the migrations.
  init:models            Initializes the models.
  init:seeders           Initializes the seeders.
  migration:create       Generates a new migration file. Aliases: migration:generate
  model:create           Generates a model and its migration. Aliases: model:generate
  seed:create            Generates a new seed file. Aliases: seed:generate
  version                Prints the version number. Aliases: v

Available manuals
  help:db:migrate             The documentation for "sequelize db:migrate".
  help:db:migrate:old_schema  The documentation for "sequelize db:migrate:old_schema".
  help:db:migrate:undo        The documentation for "sequelize db:migrate:undo".
  help:db:migrate:undo:all    The documentation for "sequelize db:migrate:undo:all".
  help:db:seed                The documentation for "sequelize db:seed".
  help:db:seed:undo           The documentation for "sequelize db:seed:undo".
  help:db:seed:undo:all       The documentation for "sequelize db:seed:undo:all".
  help:init                   The documentation for "sequelize init".
  help:init:config            The documentation for "sequelize init:config".
  help:init:migrations        The documentation for "sequelize init:migrations".
  help:init:models            The documentation for "sequelize init:models".
  help:init:seeders           The documentation for "sequelize init:seeders".
  help:migration:create       The documentation for "sequelize migration:create".
  help:model:create           The documentation for "sequelize model:create".
  help:seed:create            The documentation for "sequelize seed:create".
  help:version                The documentation for "sequelize version".
```

## Local Install Usage

```
$ node_modules/.bin/sequelize [--HARMONY-FLAGS]
```

## Options

The manuals will show all the flags and options which are available for the respective tasks.
If you find yourself in a situation where you always define certain flags in order to
make the CLI compliant to your project, you can move those definitions also into a file called
`.sequelizerc`. The file will get `require`d if available and can therefore be either a JSON file
or a Node.JS script that exports a hash.

### Example for a Node.JS script

```javascript
var path = require('path')

module.exports = {
  'config':          path.resolve('config', 'database.json'),
  'migrations-path': path.resolve('db', 'migrate')
}
```

This will configure the CLI to always treat `config/database.json` as config file and
`db/migrate` as the directory for migrations.

### CoffeeScript support

The CLI is compatible with CoffeeScript. You can tell the CLI to enable that support via the `--coffee`
flag. Please note that you'll need to install `js2coffee` and `coffee-script` for full support.

### Configuration file

By default the CLI will try to use the file `config/config.json`. You can modify that path either via
the `--config` flag or via the option mentioned earlier. Here is how a configuration file might look
like (that's is the one that `sequelize init` generates:

```json
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```


### Configuration Connection String

As an alternative to the `--config` option with configuration files defining your database, you can
use the `--url` option to pass in a connection string. For example:

`sequelize db:migrate --url 'mysql://root:password@mysql_host.com/database_name'`

### Configuration Connection Environment Variable

Another possibility is to store the URL in an environment variable and to tell
the CLI to lookup a certain variable during runtime. Let's assume you have an
environment variable called `DB_CONNECTION_STRING` which stores the value
`mysql://root:password@mysql_host.com/database_name`. In order to make the CLI
use it, you have to use declare it in your config file:

```
{
    "production": {
        "use_env_variable": "DB_CONNECTION_STRING"
    }
}
```

### Migration storage

By default the CLI will create a table in your database called `SequelizeMeta` containing an entry
for each executed migration.  Using `migrationStorage` in the configuration file you can have the
CLI create a JSON file which will contain an array with all the executed migrations.  You can
specify the path of the file using `migrationStoragePath` or the CLI will write to the file
`sequelize-meta.json`.

```json
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "migrationStorage": "json",
    "migrationStoragePath": "sequelize-meta.json"
  }
}
```

If you want to keep the information in the database and like to configure the way it's stored,
you can choose from the following configuration possibilites:

```json
{
  "development": {
    // Use a different table name. Default: SequelizeMeta
    "migrationStorageTableName": "sequelize_meta"
  }
}
```

### Schema migration

Since v1.0.0 the CLI supports a new schema for saving the executed migrations. It will tell you about that
when you run a migration while having the old schema. You can opt-in for auto migrating the schema by adding a special property to your config file:

```json
{
  "development": {
    "autoMigrateOldSchema": true
  }
}
```

### The migration schema

The CLI uses [umzug](https://github.com/sequelize/umzug) and it's migration schema. This means a migration has too look like this:

```javascript
"use strict";

module.exports = {
  up: function(queryInterface, Sequelize, done) {
    done();
  },

  down: function(queryInterface) {
    return new Promise(function (resolve, reject) {
      resolve();
    });
  }
};
```

Please note that you can either return a Promise or call the third argument of the function once your asynchronous logic was executed. If you pass something to the callback function (the `done` function) it will be treated as erroneous execution.

Additional note: If you need to access the sequelize instance, you can easily do that via `queryInterface.sequelize`.

## Help

Read the manuals via `sequelize help:<task-name>` for further information.
