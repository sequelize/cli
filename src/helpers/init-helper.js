import helpers from './index';
import path from 'path';
import fs from 'fs';
import clc from 'cli-color';

function createFolder (folderName, folder, force) {
  if (force) {
    console.log('Deleting the ' + folderName + ' folder. (--force)');

    try {
      fs.readdirSync(folder).forEach(filename => {
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
    helpers.asset.mkdirp(folder);
    console.log('Successfully created ' + folderName + ' folder at "' + folder + '".');
  } catch (e) {
    console.log(e);
  }
};

const init = {
  notifyAboutExistingFile: file => {
    helpers.view.log(
      'The file ' + clc.blueBright(file) + ' already exists. Run ' +
      '"sequelize init --force" to overwrite it.'
    );
  },

  createMigrationsFolder: force => {
    createFolder('migrations', helpers.path.getPath('migration'), force);
  },

  createSeedersFolder: force => {
    createFolder('seeders', helpers.path.getPath('seeder'), force);
  },

  createModelsFolder: force => {
    createFolder('models', helpers.path.getModelsPath(), force);
  },

  createModelsIndexFile: force => {
    const modelsPath = helpers.path.getModelsPath();
    const indexPath  = path.resolve(
      modelsPath,
      helpers.path.addFileExtension('index')
    );

    if (!helpers.path.existsSync(modelsPath)) {
      helpers.view.log('Models folder not available.');
    } else if (helpers.path.existsSync(indexPath) && !force) {
      this.notifyAboutExistingFile(indexPath);
    } else {
      const relativeConfigPath = path.relative(
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

module.exports = init;
module.exports.default = init;
