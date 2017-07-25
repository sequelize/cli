The Sequelize Command Line Interface (CLI) Frequently Asked Question

## How can I generate a model?
In the models --name is the name of the model and the --attributes are the specifications of each model
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
