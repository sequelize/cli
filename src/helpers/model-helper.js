import helpers from './index';

module.exports = {
  transformAttributes (flag) {
    const dialect = helpers.version.getDialectName();
    /*
     * SpecialDataTypes is used to filter out values postgres, mysql, sqlite, mssql.
     * It should be read from postgres instead of being enumerated.
     */
    const specialDataTypes = ['postgres', 'mysql', 'sqlite', 'mssql'];

    /*
     * Use either dataTypes for the dialect or dataTypes from Sequelize
     */
    const knownDataTypes = dialect 
      ? Object.keys(helpers.generic.getSequelize().DataTypes[dialect]) 
      : Object.keys(helpers.generic.getSequelize().DataTypes)
        .filter(dataType => specialDataTypes.indexOf(dataType) === -1); 

    /*
      possible flag formats:
      - first_name:string,last_name:string,bio:text
      - 'first_name:string last_name:string bio:text'
      - 'first_name:string, last_name:string, bio:text'
    */
    const set    = flag.replace(/,/g, ' ').split(/\s+/);
    const result = {};

    set.forEach(pair => {
      const split = pair.split(':');
    
      if (knownDataTypes.indexOf(split[1].toUpperCase()) === -1) {
        const errorText = dialect
          ? 'Unknown attribute type ' + split[1] + ' not supported in ' + dialect
          : 'Unknown attribute type ' + split[1] + ' not supported in Sequelize';
        
        console.error(errorText);
        process.exit(1);
      }
      result[split[0]] = split[1];
    });

    return result;
  },

  generateFileContent (args) {
    return helpers.template.render('models/model.js', {
      name:       args.name,
      attributes: this.transformAttributes(args.attributes),
      underscored: args.underscored
    });
  },

  generateFile (args) {
    const modelPath = helpers.path.getModelPath(args.name);

    helpers.asset.write(modelPath, this.generateFileContent(args));
  },

  modelFileExists (filePath) {
    return helpers.path.existsSync(filePath);
  }
};
