'use strict';

var fs   = require('fs-extra');
var path = require('path');
var helpers = require(__dirname);

module.exports = {
  copy: function (from, to) {
    fs.copySync(path.resolve(__dirname, '..', 'assets', from), to);
  },

  read: function (assetPath) {
    var parts = assetPath.split('/');
    var temp = helpers.path.getPath(parts[0].replace(/s$/, '')) + '/' + parts[1];
    try {
      return fs.readFileSync(temp).toString();
    } catch (e) {
      return fs.readFileSync(path.resolve(__dirname, '..', 'assets', assetPath)).toString();
    }
  },

  write: function (targetPath, content) {
    fs.writeFileSync(targetPath, content);
  },

  inject: function (filePath, token, content) {
    var fileContent = fs.readFileSync(filePath).toString();

    fs.writeFileSync(filePath, fileContent.replace(token, content));
  },

  injectConfigFilePath: function (filePath, configPath) {
    this.inject(filePath, '__CONFIG_FILE__', configPath);
  }
};
