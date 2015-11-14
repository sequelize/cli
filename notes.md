1. how to pass the commmand line argument 1. then ohw to parse it
1. then how to iterate over it inside the template?


sequelize model:create --name User --attributes "email:[type:string, unique:true, allowNull: false, {validate: { isEmail: true } }]"

email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        isEmail: true
      }    
    }


sequelize model:create --name User --attributes email:[type:string, unique:true, allowNull: false, validate: [ isEmail: true ]]




email:[type:string:unique:true:allowNull:false [validate: [ isEmail: true ] ]] name:[type:string]

email:[type:string, unique:true, allowNull: false, validate: [ isEmail: true ]]


11/13/15 1130am -- Trying to Run Tests, need to connect to DB, looking for config.json file...

!!!! in /test/support/index.js set env variable to sqlite

!!!! in gulp file created two new tasks - test-model and tes-migrate