var fs   = require('fs')
  , args = require('yargs').argv

module.exports = {
  mkdirp: function (path, root) {
    var dirs = path.split('/')
      , dir  = dirs.shift()

    root = (root || '') + dir + '/'

    try {
      fs.mkdirSync(root)
    } catch (e) {
      // dir wasn't made, something went wrong
      if (!fs.statSync(root).isDirectory()) {
        throw new Error(e)
      }
    }

    return !dirs.length || this.mkdirp(dirs.join('/'), root)
  },

  getEnvironment: function() {
    return process.env.NODE_ENV || args.env || 'development'
  }
}
