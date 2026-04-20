import fs from 'fs';
import path from 'path';

function copyRecursiveSync(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const assets = {
  copy: (from, to) => {
    copyRecursiveSync(path.resolve(__dirname, '..', 'assets', from), to);
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
    this.inject(filePath, '__CONFIG_FILE__', configPath);
  },

  mkdirp: (pathToCreate) => {
    fs.mkdirSync(pathToCreate, { recursive: true });
  },
};

module.exports = assets;
module.exports.default = assets;
