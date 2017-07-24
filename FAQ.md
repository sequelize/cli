# sequelize/cli [![Build Status](https://travis-ci.org/sequelize/cli.svg?branch=master)](https://travis-ci.org/sequelize/cli) [![Code Climate](https://codeclimate.com/github/sequelize/cli.png)](https://codeclimate.com/github/sequelize/cli) [![Greenkeeper badge](https://badges.greenkeeper.io/sequelize/cli.svg)](https://greenkeeper.io/)

The Sequelize Command Line Interface (CLI) Frequently Asked Question

How can I generate a model?
This is a basic example for a model generation. Also you can add more attributes and datatypes as you needed.
``` 
$ sequelize model:create --name User --attributes name:string,state:boolean,birth:date,card:integer
```

What is the command to executes all migrations?
```
sequelize db:migrate
```
How can I make a migrations rollback?

```
sequelize db:migrate:undo:all
```
