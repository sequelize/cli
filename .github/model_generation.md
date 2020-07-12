## What you are doing?
I am trying to use the CLI to generate the model file

```js
npx sequelize-cli model:generate --name users --attributes name:string,email:string,fav_pizza:string,space_invaders:integer
```

## What do you expect to happen?
The model is created but it only has the first field declared after attributes, in this case the name field. If I change the field order, then whatever field is first declared is the only field created in the model file.

## What is actually happening?
```
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    name: DataTypes.STRING
  }, {});
  users.associate = function(models) {
    // associations can be defined here
  };
  return users;
};
```
__Node:__ 12.16.2
__Dialect:__  any
__Database version:__ XXX
__Sequelize CLI version:__ 5.5.1
__Sequelize version:__ 5.22.3
