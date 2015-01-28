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
Sequelize [CLI: v0.0.4, ORM: v1.7.5]


Usage
  sequelize [task]

Available tasks
  db:migrate        Run pending migrations.
  db:migrate:undo   Revert the last migration run.
  help              Display this help text. Aliases: h
  init              Initializes the project.
  init:config       Initializes the configuration.
  init:migrations   Initializes the migrations.
  init:models       Initializes the models.
  migration:create  Generates a new migration file. Aliases: migration:generate
  version           Prints the version number. Aliases: v

Available manuals
  help:db:migrate        The documentation for 'sequelize db:migrate'.
  help:db:migrate:undo   The documentation for 'sequelize db:migrate:undo'.
  help:init              The documentation for 'sequelize init'.
  help:init:config       The documentation for 'sequelize init:config'.
  help:init:migrations   The documentation for 'sequelize init:migrations'.
  help:init:models       The documentation for 'sequelize init:models'.
  help:migration:create  The documentation for 'sequelize migration:create'.
  help:version           The documentation for 'sequelize version'.
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

## Help

Read the manuals via `sequelize help:<task-name>` for further information.
