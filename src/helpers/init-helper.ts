import { helpers } from './index';
import path from 'path';
import fs from 'fs';

function createFolder(
  folderName: string,
  folder: string,
  force: boolean
): void {
  if (force && fs.existsSync(folder) === true) {
    helpers.view.log('Deleting the ' + folderName + ' folder. (--force)');

    try {
      fs.readdirSync(folder).forEach((filename: string) => {
        fs.unlinkSync(path.resolve(folder, filename));
      });
    } catch (e) {
      helpers.view.error(e as Error);
    }

    try {
      fs.rmdirSync(folder);
      helpers.view.log('Successfully deleted the ' + folderName + ' folder.');
    } catch (e) {
      helpers.view.error(e as Error);
    }
  }

  try {
    if (fs.existsSync(folder) === false) {
      helpers.asset.mkdirp(folder);
      helpers.view.log(
        'Successfully created ' + folderName + ' folder at "' + folder + '".'
      );
    } else {
      helpers.view.log(
        folderName + ' folder at "' + folder + '" already exists.'
      );
    }
  } catch (e) {
    helpers.view.error(e as Error);
  }
}

export const initHelper = {
  createMigrationsFolder: (force: boolean = false): void => {
    createFolder('migrations', helpers.path.getPath('migration'), force);
  },

  createSeedersFolder: (force = false): void => {
    createFolder('seeders', helpers.path.getPath('seeder'), force);
  },

  createModelsFolder: (force: boolean): void => {
    createFolder('models', helpers.path.getModelsPath(), force);
  },

  createModelsIndexFile: (force: boolean): void => {
    const modelsPath = helpers.path.getModelsPath();
    const indexPath = path.resolve(
      modelsPath,
      helpers.path.addFileExtension('index')
    );

    if (!helpers.path.existsSync(modelsPath)) {
      helpers.view.log('Models folder not available.');
    } else if (helpers.path.existsSync(indexPath) && !force) {
      helpers.view.notifyAboutExistingFile(indexPath);
    } else {
      const relativeConfigPath = path.relative(
        helpers.path.getModelsPath(),
        helpers.config.getConfigFile()
      );

      helpers.asset.write(
        indexPath,
        helpers.template.render(
          'models/index.js',
          {
            configFile:
              "__dirname + '/" + relativeConfigPath.replace(/\\/g, '/') + "'",
          },
          {
            beautify: false,
          }
        )
      );
    }
  },
};
