import helpers from './index';

module.exports = {
  transformAttributes (flag) {
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
