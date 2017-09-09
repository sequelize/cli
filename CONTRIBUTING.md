# Contributing

Sequelize CLI is entirely driven by community contributions. Any little contribution with code or documentation work helps us keeping this project running.

You can help us in various ways

## Reporting Bugs

### Security Issues

Although CLI is never supposed to be web facing, we still want to fix any security issues. Please contact project maintainers **privately**. You can find more information [here](https://github.com/sequelize/sequelize/blob/master/CONTACT.md).

### General Issues or Feature Requests

Github issues should follow specified template. When you start creating a new issue, an empty template will be already filled.

Please make sure issue you are reporting is strictly related to Sequelize CLI.

If you want to propose new features to Sequelize CLI, you may ignore issue template. You still need to clearly state new feature. Feature request should give various examples, API suggestions and references to support idea behind it.

## Fixing Bugs or Implementing Features

### Preparing your environment

Start with cloning Sequelize CLI repo

```bash
$ git clone git@github.com:sequelize/cli.git

$ git clone https://github.com/sequelize/cli.git # Using HTTPS
```

Make sure you have all required dependencies, you will need

- Node v4 or above
- NPM v3 or above

Now go to cloned repository folder

```bash
$ cd /path/to/cloned/repository
```

Install required modules

```bash
$ npm install
```

### Running tests

By default CLI use SQLite, which requires no database configuration. We use Babel to build CLI. Running default test command will automatically build it for you.

```bash
$ npm test
```

Test can take about 7 to 10 minutes to finish, subjected to hardware configuration.

## Improving Documentation

If you want to improve or expand our documentation you can start with documentation in `/docs` folder of this repository.

You can also help by improving [Migration section](http://docs.sequelizejs.com/manual/tutorial/migrations.html). Please read more about contributing to Sequelize Docs [here](https://github.com/sequelize/sequelize/blob/master/CONTRIBUTING.DOCS.md)
