# sequelize/cli [![npm version](https://badge.fury.io/js/sequelize-cli.svg)](https://badge.fury.io/js/sequelize-cli) [![Build Status](https://travis-ci.org/sequelize/cli.svg?branch=master)](https://travis-ci.org/sequelize/cli) [![Greenkeeper badge](https://badges.greenkeeper.io/sequelize/cli.svg)](https://greenkeeper.io/)

The Sequelize Command Line Interface (CLI)

## Table of Contents
- [Installation](#installation)
- [Contributing](#contributing)
- [Sequelize Support](#sequelize-support)
- [Documentation](#documentation)

## Installation

### Globally
Install CLI globally with

```bash
$ npm install -g sequelize-cli
```

Now you can run CLI using following command anywhere

```bash
$ sequelize
```

### Locally
Install CLI locally to your `node_modules` folder with

```bash
$ npm install --save sequelize-cli
```

You should be able to run CLI with

```bash
$ node_modules/.bin/sequelize
```

### Usage
```
Sequelize CLI [Node: 6.11.2, CLI: 3.0.0, ORM: 4.8.0]

Commands:
  db:migrate                        Run pending migrations
  db:migrate:schema:timestamps:add  Update migration table to have timestamps
  db:migrate:status                 List the status of all migrations
  db:migrate:undo                   Reverts a migration
  db:migrate:undo:all               Revert all migrations ran
  db:seed                           Run specified seeder
  db:seed:undo                      Deletes data from the database
  db:seed:all                       Run every seeder
  db:seed:undo:all                  Deletes data from the database
  db:create                         Create database specified by configuration
  db:drop                           Drop database specified by configuration
  init                              Initializes project
  init:config                       Initializes configuration
  init:migrations                   Initializes migrations
  init:models                       Initializes models
  init:seeders                      Initializes seeders
  migration:generate                Generates a new migration file       [aliases: migration:create]
  model:generate                    Generates a model and its migration  [aliases: model:create]
  seed:generate                     Generates a new seed file            [aliases: seed:create]

Options:
  --version  Show version number                                         [boolean]
  --help     Show help                                                   [boolean]
```

## Contributing

Sequelize CLI is always looking for contributions. You can help us with fixing bugs, reporting bugs or improving documentation.

Please read [contributing documentation](CONTRIBUTING.md)

## Documentation

- [Migrations Documentation](http://docs.sequelizejs.com/manual/tutorial/migrations.html)
- [CLI Options](docs/README.md)
- [Frequently Asked Questions](docs/FAQ.md)
