var fs   = require('fs-extra')
  , path = require('path')

module.exports = {
  copy: function (from, to) {
    fs.copySync(path.resolve(__dirname, '..', 'assets', from), to)
  },

  injectConfigFilePath: function(filePath, configPath) {
    var fileContent = fs.readFileSync(filePath).toString()
    fs.writeFileSync(filePath, fileContent.replace('__CONFIG_FILE__', configPath)
    )
  }
}
