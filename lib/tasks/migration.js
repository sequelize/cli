'use strict';

var path      = require('path');
var helpers   = require(path.resolve(__dirname, '..', 'helpers'));
var args      = require('yargs').argv;
var fs        = require('fs');
var clc       = require('cli-color');

module.exports = {
  'migration:create': {
    descriptions: {
      'short': 'Generates a new migration file.',
      options: {
        '--name': 'Defines the name of the migration. ' +
          clc.blueBright('Default: unnamed-migration'),
        '--underscored': 'Use snake case for the timestamp\'s attribute names',
        '--es6': 'Use es6 arrow function instead of traditional function',
      }
    },

    aliases: [ 'migration:generate' ],

    task: function () {
      var config        = null;
      var skeletonPath  = null;

      helpers.init.createMigrationsFolder();

      try {
        config = helpers.config.readConfig();
      } catch (e) {
        console.log(e.message);
        process.exit(1);
      }

      skeletonPath = !helpers.config.supportsCoffee() && args.es6 ?
        'migrations/skeleton-es6.js' :
        'migrations/skeleton.js';

      fs.writeFileSync(
        helpers.path.getMigrationPath(args.name),
        helpers.template.render(skeletonPath, {}, {
          beautify: false
        })
      );

      helpers.view.log(
        'New migration was created at',
        clc.blueBright(helpers.path.getMigrationPath(args.name)),
        '.'
      );
    }
  }
};
