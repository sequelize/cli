'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const assets = {
  copy: (from, to) => {
    _fsExtra2.default.copySync(_path2.default.resolve(__dirname, '..', 'assets', from), to);
  },

  read: assetPath => {
    return _fsExtra2.default.readFileSync(_path2.default.resolve(__dirname, '..', 'assets', assetPath)).toString();
  },

  write: (targetPath, content) => {
    _fsExtra2.default.writeFileSync(targetPath, content);
  },

  inject: (filePath, token, content) => {
    const fileContent = _fsExtra2.default.readFileSync(filePath).toString();
    _fsExtra2.default.writeFileSync(filePath, fileContent.replace(token, content));
  },

  injectConfigFilePath: (filePath, configPath) => {
    undefined.inject(filePath, '__CONFIG_FILE__', configPath);
  },

  mkdirp: pathToCreate => {
    _fsExtra2.default.mkdirpSync(pathToCreate);
  }
};

module.exports = assets;
module.exports.default = assets;