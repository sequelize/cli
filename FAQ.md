The Sequelize Command Line Interface (CLI) Frequently Asked Question

## Initialize sequelize to create necessary files in the project 
```
sequelize init
```

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

## How can I create a seeder?
Specify seeder name with `--name` argument
```
sequelize seed:create --name <seeder_name> 
```

## How can I run the seeders?
```
sequelize db:seed:all
```

## How can I make the seeders rollback?
```
sequelize db:seed:undo:all
```

