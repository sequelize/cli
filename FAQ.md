The Sequelize Command Line Interface (CLI) Frequently Asked Question

## How to install sequelize-cli globally?
```
npm install sequelize-cli -g
```

## How to install sequelize-cli inside the project (locally)?
```
npm install sequelize --save
```

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

## Seeders

## How can I create a seeder?
```
sequelize seed:create --name seederName 
```

## How can I run the seeders?
```
sequelize db:seed:all
```

## How can I make the seeders rollback?
```
sequelize db:seed:undo:all
```

