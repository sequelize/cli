'use strict';

var fs   = require('fs-extra');
var path = require('path');
var pathHelper = require(path.resolve(__dirname, 'path-helper'));

module.exports = {
  copy: function (from, to) {
    fs.copySync(path.resolve(__dirname, '..', 'assets', from), to);
  },

  read: function (assetPath) {
    // break assetPath into parts, example (['seeders', 'skeleton.js'])
    var parts = assetPath.split(path.sep);
    // Get the project's asset type from folder name, removing the pluralized trailing s
    var assetType = parts[0].replace(/s$/, ''); // example: seeder
    var skeletonFilename = parts[1]; // example: skeleton.js
    var temp = path.resolve(pathHelper.getPath(assetType), skeletonFilename);

    // Try to load the skeleton file, fallback to the skeleton provided in the assets path
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
