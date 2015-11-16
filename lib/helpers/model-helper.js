'use strict';

var clc     = require('cli-color');
var helpers = require(__dirname);

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

    /*
    proposed flag format:
      - name:[type:string,required:true] email:[type:string,required:true]
      - name:string email:[type:string,required:true], first_name:string, last_name:string
    */

    /*  
    deprecated flag format:
      - first_name:string,last_name:string,bio:text
    */
    
    var self = this;
    var copy = flag.slice();
    var arr = copy.split(' ');
    
    var stringObj = arr.map(function(str){
      var newStr = str.replace(/\[/g, '{');
      result = newStr.replace(/\]/g, '}'); 
      if (result[result.length-1] === ',') {
          var tempArr = result.split('');
          tempArr.splice(result.length-1, 1);
          result = tempArr.join('');
      }
      return result;
    });

    var result = stringObj.reduce(function(prev, curr) {
      var obj = self.objectifyString(curr);
      prev[obj[0]] = obj[1];
      return prev;
    }, {});
    
    return result;
  },

  objectifyString: function(str) {
        
    var splitPoint = str.indexOf(':');
    var field = str.slice(0, splitPoint);
    
    if (str.indexOf('{') === -1) {
      var typeValue = str.split(':')[1];
      return [field, {type: typeValue}];
    }

    var start = str.indexOf('{');
    var end = str.indexOf('}');
    var preObj = str.slice(start+1, end);
    var attrArr = preObj.split(',');
    var pairs = attrArr.map(function(str){
      return str.split(':');
    });

    var attrObj = pairs.reduce(function(prev, curr){
      prev[curr[0]] = curr[1];
      return prev;
    }, {});

    this.convertValueToType(attrObj);
    return [field, attrObj];
    
  },

  convertValueToType: function(obj) {
    return Object.keys(obj).forEach(function(attr) {
      var value = obj[attr]; 
      if (value === 'true' || value === 'false') {
        obj[attr] = Boolean(value);
      }            
      else if (parseInt(value)) {
        obj[attr] = parseInt(value);
      }
    });
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
    return helpers.path.existsSync(filePath);
  }
};
