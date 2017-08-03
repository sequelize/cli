The Sequelize Command Line Interface (CLI) Frequently Asked Question

## How can I generate a model?
Specify model name with `--name` argument. List of table fields can be passed with `--attributes` option
``` 
$ sequelize model:create --name User --attributes name:string,state:boolean,birth:date,card:integer
```

## What is the command to executes all migrations?
```
sequelize db:migrate
```
## How can I make a migrations rollback?

```
sequelize db:migrate:undo:all
```
## How can I run a specific seed file?

```
sequelize db:seed --seed [seed file name]
```
