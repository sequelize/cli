'use strict';

var path    = require('path');
var helpers = require(path.resolve(__dirname, '..', 'helpers'));
var args    = require('yargs').argv;
var clc     = require('cli-color');
var _       = require('lodash');

module.exports = {
  'init': {
    descriptions: {
      'short': 'Initializes the project.',
      'long': (function () {
        var result = [
          'The command will initialize the current directory.',
          'In detail this means, that you will find the following items afterwards:',
          ''
        ];

        var items = {
          'config': 'A folder that contains the config files.',
          'config/config.json': 'A file that contains the configuration for the ORM.',
          'migrations': 'A folder that contains the migration files.',
          'seeders': 'A folder that contains the seed files.',
          'models': 'A folder that contains the model files.',
          'models/index.js': 'A file that can be required to load all the models.'
        };

        _.forEach(items, function (value, key) {
          result.push([
            clc.blueBright(helpers.view.pad(key, items)),
            value
          ].join(' '));
        });

        result = result.concat([
          '',
          'Most of the files and folders can be changed to fit custom folder structures.',
          'Check the options for further information.'
        ]);

        return result;
      })(),

      options: {
        '--force': 'Will drop the existing config folder and re-create it. ' +
          clc.blueBright('Default: false')
      }
    },

    dependencies: [
      'init:config',
      'init:migrations',
      'init:seeders',
      'init:models'
    ],

    task: function () {}
  },

  'init:config': {
    descriptions: {
      'short': 'Initializes the configuration.'
    },

    task: function () {
      if (!helpers.config.configFileExists() || !!args.force) {
        helpers.config.writeDefaultConfig();
        console.log('Created "' + helpers.config.relativeConfigFile() + '"');
      } else {
        helpers.init.notifyAboutExistingFile(helpers.config.relativeConfigFile());
        process.exit(1);
      }
    }
  },

  'init:models': {
    descriptions: {
      'short': 'Initializes the models.'
    },

    task: function () {
      helpers.init.createModelsFolder(!!args.force);
      helpers.init.createModelsIndexFile(!!args.force);
    }
  },

  'init:migrations': {
    descriptions: {
      'short': 'Initializes the migrations.'
    },

    task: function () {
      helpers.init.createMigrationsFolder(!!args.force);
    }
  },

  'init:seeders': {
    descriptions: {
      'short': 'Initializes the seeders.'
    },

    task: function () {
      helpers.init.createSeedersFolder(!!args.force);
    }
  }
};
