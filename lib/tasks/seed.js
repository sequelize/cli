'use strict';

var path      = require('path');
var helpers   = require(path.resolve(__dirname, '..', 'helpers'));
var args      = require('yargs').argv;
var fs        = require('fs');
var clc       = require('cli-color');

module.exports = {
  'seed:create': {
    descriptions: {
      'short': 'Generates a new seed file.',
      options: {
        '--name': 'Defines the name of the seed. ' +
          clc.blueBright('Default: unnamed-seed'),
        '--es6': 'Use es6 arrow function instead of traditional function',
      }
    },

    aliases: [ 'seed:generate' ],

    task: function () {
      var config        = null;
      var skeletonPath  = null;

      helpers.init.createSeedersFolder();

      try {
        config = helpers.config.readConfig();
      } catch (e) {
        console.log(e.message);
        process.exit(1);
      }

      skeletonPath = !helpers.config.supportsCoffee() && args.es6 ?
        'seeders/skeleton-es6.js' :
        'seeders/skeleton.js';

      fs.writeFileSync(
        helpers.path.getSeederPath(args.name),
        helpers.template.render(skeletonPath, {}, {
          beautify: false
        })
      );

      helpers.view.log(
        'New seed was created at',
        clc.blueBright(helpers.path.getSeederPath(args.name)),
        '.'
      );
    }
  }
};
