# sequelize/cli [![npm version](https://badge.fury.io/js/sequelize-cli.svg)](https://npmjs.com/package/sequelize-cli) [![CI](https://github.com/sequelize/cli/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sequelize/cli/actions/workflows/ci.yml)

The [Sequelize](https://sequelize.org) Command Line Interface (CLI)

## Table of Contents

- [Installation](#installation)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Installation

Make sure you have [Sequelize](https://sequelize.org) installed. Then install the Sequelize CLI to be used in your project with

```bash
npm install --save-dev sequelize-cli
```

And then you should be able to run the CLI with

```bash
npx sequelize --help
```

### Usage

```bash
Sequelize CLI [Node: 10.21.0, CLI: 6.0.0, ORM: 6.1.0]

sequelize <command>

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
  sequelize migration:generate                Generates a new migration file      [aliases: migration:create]
  sequelize model:generate                    Generates a model and its migration [aliases: model:create]
  sequelize seed:generate                     Generates a new seed file           [aliases: seed:create]

Options:
  --version  Show version number                                                  [boolean]
  --help     Show help                                                            [boolean]

Please specify a command
```

## Contributing

All contributions are accepted as a PR.

- You can file issues by submitting a PR (with test) as a test case.
- Implement new feature by submitting a PR
- Improve documentation by submitting PR to [Sequelize](https://github.com/sequelize/sequelize)

Please read the [contributing guidelines](CONTRIBUTING.md).

## Documentation

- [Migrations Documentation](https://sequelize.org/master/manual/migrations.html)
- [CLI Options](docs/README.md)
- [Frequently Asked Questions](docs/FAQ.md)
