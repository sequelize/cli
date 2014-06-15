# sequelize/cli [![Build Status](https://travis-ci.org/sequelize/cli.svg?branch=master)](https://travis-ci.org/sequelize/cli) [![Code Climate](https://codeclimate.com/github/sequelize/cli.png)](https://codeclimate.com/github/sequelize/cli)

The sequelize CLI.

## Installation

```
npm install --save sequelize-cli
```

## Usage

```
$ node_modules/.bin/sequelize
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

## Help

Read the manuals via `sequelize help:<task-name>` for further information.
