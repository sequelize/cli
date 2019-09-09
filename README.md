# sequelize/cli [![npm version](https://badge.fury.io/js/sequelize-cli.svg)](https://badge.fury.io/js/sequelize-cli) [![Build Status](https://travis-ci.org/sequelize/cli.svg?branch=master)](https://travis-ci.org/sequelize/cli) [![Greenkeeper badge](https://badges.greenkeeper.io/sequelize/cli.svg)](https://greenkeeper.io/)

The [Sequelize](https://sequelize.org) Command Line Interface (CLI)

## Table of Contents
- [Installation](#installation)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Installation

Make sure you have [Sequelize](https://sequelize.org) installed. Then install the Sequelize CLI to be used in your project with

```bash
$ npm install --save-dev sequelize-cli
```

And then you should be able to run the CLI with

```bash
$ npx sequelize --help
```

### Usage

```
Sequelize CLI [Node: 10.15.0, CLI: 5.5.0, ORM: 5.11.0]

npx sequelize [command]

Commands:
  sequelize db:migrate                        Run pending migrations
  sequelize db:migrate:schema:timestamps:add  Update migration table to have timestamps
  sequelize db:migrate:status                 List the status of all migrations
  sequelize db:migrate:undo                   Reverts a migration
  sequelize db:migrate:undo:all               Revert all migrations ran
  sequelize db:seed                           Run specified seeder
  sequelize db:seed:undo                      Deletes data from the database
  sequelize db:seed:all                       Run every seeder
  sequelize db:seed:undo:all                  Deletes data from the database
  sequelize db:create                         Create database specified by configuration
  sequelize db:drop                           Drop database specified by configuration
  sequelize init                              Initializes project
  sequelize init:config                       Initializes configuration
  sequelize init:migrations                   Initializes migrations
  sequelize init:models                       Initializes models
  sequelize init:seeders                      Initializes seeders
  sequelize migration:generate                Generates a new migration file       [aliases: migration:create]
  sequelize model:generate                    Generates a model and its migration  [aliases: model:create]
  sequelize seed:generate                     Generates a new seed file            [aliases: seed:create]

Options:
  --version  Show version number                                         [boolean]
  --help     Show help                                                   [boolean]
```

## Contributing

Sequelize CLI is always looking for contributions. You can help us by fixing bugs, reporting bugs or improving documentation.

Please read the [contributing guidelines](CONTRIBUTING.md).

## Documentation

- [Migrations Documentation](https://sequelize.org/master/manual/migrations.html)
- [CLI Options](docs/README.md)
- [Frequently Asked Questions](docs/FAQ.md)
