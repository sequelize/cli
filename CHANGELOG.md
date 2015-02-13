# Change Log
All notable changes to this project will be documented in this file.

# 1.3.0 
- Add builds for different sequelize versions
- Fix raw queries in sequelize 2.0

# 1.2.0
- Add logging of statements and improve messages

# 1.1.0
- Update dependencies

# 1.0.8
- Fix usage of js2coffee 2.0

# 1.0.7
- Fix regexp application for non migration files.

# 1.0.6
- Add support for more fine-granular harmony flags

# 1.0.5
- Added support for auto-migrate from old schema [#82](https://github.com/sequelize/cli/issues/82)

# 1.0.4
- Fix output filtering
- Fix EventEmitter deprecation warnings.

# 1.0.3
- Use the url module to parse database URLs

# 1.0.1
- Fix global installation of the CLI

# 1.0.0
- Big migration refactoring which uses a new schema table and the umzug lib.

# 0.3.3
- Fix for default attributes in generated migrations.
- Auto-generate coffee files with js2coffee.

# 0.3.2
- Add default attributes to generated migrations.

# 0.3.1
- Fix alignment of comment in generated model file
- Fix global installation

# 0.3.0
- Add Node.JS version to the teaser
- Add dialect and the respective version to the teaser

# 0.2.6
- Do not load lodash in `models/index.js`.

# 0.2.5
- Prefer `--env` over the environment variable `NODE_ENV`.
- Search by default for a file called `.sequelizerc` and treat it as `--options-path`.

# 0.2.4
- Fix unqualified sequelize instantiation which enforced the mysql module.

# 0.2.3
- Fix `--migrations-path` for relative paths.

# 0.2.2
- Fix for MS Windows.

# 0.2.1
- Fix `_.includes`.

# 0.2.0
- `sequelize model:create` creates a model and its respective migration file.

# 0.1.1
- Fix illegal character.

# 0.1.0
- `sequelize init` now creates a `models` folder and a `models/index.js` file. [#11](https://github.com/sequelize/cli/pull/11)

# 0.0.4
- Fix --config flag. [#4](https://github.com/sequelize/cli/pull/4)
- Fix custom logging option. [#3](https://github.com/sequelize/cli/pull/3)

# 0.0.3
- Fix conflict within projects that are already shipping gulp. [#2](https://github.com/sequelize/cli/pull/2)
- Add harmony support. [#6](https://github.com/sequelize/cli/pull/6)

# 0.0.2
- Added the binary to the package.json

# 0.0.1
- First working version
