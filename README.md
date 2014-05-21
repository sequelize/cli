# sequelize/cli ![Build status](https://api.travis-ci.org/sequelize/cli.png)

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
node_modules/.bin/sequelize

Usage
  sequelize [task]

Available tasks
  db:migrate        Run pending migrations.
  db:migrate:undo   Revert the last migration run.
  help              Display this help text. Aliases: h
  init              Initializes the project.
  migration:create  Generates a new migration file. Aliases: migration:generate
  version           Prints the version number. Aliases: v

Available manuals
  help:db:migrate        The documentation for 'sequelize db:migrate'.
  help:db:migrate:undo   The documentation for 'sequelize db:migrate:undo'.
  help:init              The documentation for 'sequelize init'.
  help:migration:create  The documentation for 'sequelize migration:create'.
  help:version           The documentation for 'sequelize version'.

```

## Help

Read the manuals via `sequelize help:db:migrate` for further information.
