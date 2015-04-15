'use strict';

var helpers = require(__dirname);
var clc     = require('cli-color');
var fs      = require('fs-extra');

module.exports = {
  notifyAboutExistingFile: function (file) {
    helpers.view.error(
      'The file ' + clc.blueBright(file) + ' already exists. ' +
      'Run "sequelize model:create --force" to overwrite it.'
    );
  },

  transformAttributes: function (flag) {
    /*
      possible flag formats:
      - first_name:string,last_name:string,bio:text
      - 'first_name:string last_name:string bio:text'
      - 'first_name:string, last_name:string, bio:text'
    */

    var set    = flag.replace(/,/g, ' ').split(/\s+/);
    var result = {};

    set.forEach(function (pair) {
      var split = pair.split(':');

      result[split[0]] = split[1];
    });

    return result;
  },

  generateFileContent: function (args) {
    return helpers.template.render('models/model.js', {
      name:       args.name,
      attributes: this.transformAttributes(args.attributes)
    });
  },

  generateFile: function (args) {
    var modelPath = helpers.path.getModelPath(args.name);

    helpers.asset.write(modelPath, this.generateFileContent(args));
  },

  modelFileExists: function (filePath) {
    return fs.existsSync(filePath);
  }
};
