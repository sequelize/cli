'use strict';

var helpers = require(__dirname);
var path    = require('path');
var fs      = require('fs');
var clc     = require('cli-color');

module.exports = {
  notifyAboutExistingFile: function (file) {
    helpers.view.log(
      'The file ' + clc.blueBright(file) + ' already exists. Run ' +
      '"sequelize init --force" to overwrite it.'
    );
  },

  createFolder: function (folderName, folder, force) {
    if (force) {
      console.log('Deleting the ' + folderName + ' folder. (--force)');

      try {
        fs.readdirSync(folder).forEach(function (filename) {
          fs.unlinkSync(path.resolve(folder, filename));
        });
      } catch (e) {
        console.log(e);
      }

      try {
        fs.rmdirSync(folder);
        console.log('Successfully deleted the ' + folderName + ' folder.');
      } catch (e) {
        console.log(e);
      }
    }

    try {
      helpers.generic.mkdirp(folder);
      console.log('Successfully created ' + folderName + ' folder at "' + folder + '".');
    } catch (e) {
      console.log(e);
    }
  },

  createMigrationsFolder: function (force) {
    this.createFolder('migrations', helpers.path.getPath('migration'), force);
  },

  createSeedersFolder: function (force) {
    this.createFolder('seeders', helpers.path.getPath('seeder'), force);
  },

  createModelsFolder: function (force) {
    this.createFolder('models', helpers.path.getModelsPath(), force);
  },

  createModelsIndexFile: function (force) {
    var modelsPath = helpers.path.getModelsPath();
    var indexPath  = path.resolve(
      modelsPath,
      helpers.path.addFileExtension('index')
    );

    if (!helpers.path.existsSync(modelsPath)) {
      helpers.view.log('Models folder not available.');
    } else if (helpers.path.existsSync(indexPath) && !force) {
      this.notifyAboutExistingFile(indexPath);
    } else {
      var relativeConfigPath = path.relative(
        helpers.path.getModelsPath(),
        helpers.config.getConfigFile()
      );

      helpers.asset.write(
        indexPath,
        helpers.template.render('models/index.js', {
          configFile: '__dirname + \'/' + relativeConfigPath + '\''
        }, {
          beautify: false
        })
      );
    }
  }
};
