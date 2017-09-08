import fs from 'fs-extra';
import path from 'path';

const assets = {
  copy: (from, to) => {
    fs.copySync(path.resolve(__dirname, '..', 'assets', from), to);
  },

  read: assetPath => {
    return fs.readFileSync(path.resolve(__dirname, '..', 'assets', assetPath)).toString();
  },

  write: (targetPath, content) => {
    fs.writeFileSync(targetPath, content);
  },

  inject: (filePath, token, content) => {
    const fileContent = fs.readFileSync(filePath).toString();
    fs.writeFileSync(filePath, fileContent.replace(token, content));
  },

  injectConfigFilePath: (filePath, configPath) => {
    this.inject(filePath, '__CONFIG_FILE__', configPath);
  },

  mkdirp: pathToCreate => {
    fs.mkdirpSync(pathToCreate);
  }
};

module.exports = assets;
module.exports.default = assets;