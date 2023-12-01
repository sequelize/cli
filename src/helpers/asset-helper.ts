import fs from 'fs-extra';
import path from 'path';

interface Assets {
  copy: (from: string, to: string) => void;
  read: (assetPath: string) => string;
  write: (targetPath: string, content: string) => void;
  inject: (filePath: string, token: string, content: string) => void;
  injectConfigFilePath: (filePath: string, configPath: string) => void;
  mkdirp: (pathToCreate: string) => void;
}

export const assetsHelper: Assets = {
  copy: (from, to) => {
    fs.copySync(path.resolve(__dirname, '..', 'assets', from), to);
  },

  read: (assetPath) => {
    return fs
      .readFileSync(path.resolve(__dirname, '..', 'assets', assetPath))
      .toString();
  },

  write: (targetPath, content) => {
    fs.writeFileSync(targetPath, content);
  },

  inject: (filePath, token, content) => {
    const fileContent = fs.readFileSync(filePath).toString();
    fs.writeFileSync(filePath, fileContent.replace(token, content));
  },

  injectConfigFilePath: (filePath, configPath) => {
    assetsHelper.inject(filePath, '__CONFIG_FILE__', configPath);
  },

  mkdirp: (pathToCreate) => {
    fs.mkdirpSync(pathToCreate);
  },
};
