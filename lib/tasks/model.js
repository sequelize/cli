'use strict';

var path    = require('path');
var helpers = require(path.resolve(__dirname, '..', 'helpers'));
var args    = require('yargs').argv;
var clc     = require('cli-color');

module.exports = {
  'model:create': {
    aliases: [ 'model:generate' ],

    descriptions: {
      'short': 'Generates a model and its migration.',

      'long': (function () {
        var migrationFileName = helpers.path.getFileName(
          'migration',
          helpers.migration.generateMigrationName({ name: 'User' }),
          { ignoreConfig: true }
        );

        var result = [
          'This task generates a model file and its respective migration.',
          'It is necessary to specify the name of the new model as well as',
          'the model\'s attributes.',
          '',
          'The attributes can be specified as in the following (and semantically equal) examples:',
          '',
          'sequelize model:create --name User --attributes ' +
            'first_name:string,last_name:string,bio:text',
          'sequelize model:create --name User --attributes ' +
            '\'first_name:string last_name:string bio:text\'',
          'sequelize model:create --name User --attributes ' +
            '\'first_name:string, last_name:string, bio:text\'',
          '',
          'This command will generate a new migration and model definition:',
          '',
          '// the model file',
          '// located under models/user.js'
        ];

        result = result.concat(
          helpers.model.generateFileContent({
            name: 'User',
            attributes: 'first_name:string,last_name:string,bio:text'
          }).split('\n')
        );

        result = result.concat([
          '',
          '// the migration file',
          '// located under migrations/' + migrationFileName
        ]);

        result = result.concat(
          helpers.migration.generateTableCreationFileContent({
            name: 'User',
            attributes: 'first_name:string,last_name:string,bio:text',
            underscored: args.underscored
          }).split('\n')
        );

        return result;
      })(),

      options: {
        '--name': 'The name of the new model.',
        '--attributes': 'A list of attributes.',
        '--underscored': 'Set timestamps to snake_case'
      }
    },

    preChecks: [
      function ensureAttributesFlag () {
        if (!args.attributes) {
          helpers.view.error(
            'Unspecified flag ' +
            clc.blueBright('"attributes"') +
            '. Check the manual for further details.'
          );
          process.exit(1);
        }
      },

      function ensureNameFlag () {
        if (!args.name) {
          helpers.view.error(
            'Unspecified flag ' + clc.blueBright('"name"') +
            '. Check the manual for further details.'
          );
          process.exit(1);
        }
      },

      function ensureModelsFolder () {
        if (!helpers.path.existsSync(helpers.path.getModelsPath())) {
          helpers.view.error(
            'Unable to find models path (' +
            helpers.path.getModelsPath() +
            '). Did you run ' + clc.blueBright('sequelize init') + '?'
          );
          process.exit(1);
        }
      },

      function ensureMigrationsFolder () {
        if (!helpers.path.existsSync(helpers.path.getPath('migration'))) {
          helpers.view.error(
            'Unable to find migrations path (' +
            helpers.path.getPath('migration') +
            '). Did you run ' + clc.blueBright('sequelize init') + '?'
          );
          process.exit(1);
        }
      },

      function checkModelFileExistence () {
        var modelPath = helpers.path.getModelPath(args.name);

        if (!args.force && helpers.model.modelFileExists(modelPath)) {
          helpers.model.notifyAboutExistingFile(modelPath);
          process.exit(1);
        }
      }
    ],

    task: function () {
      this.preChecks.forEach(function (preCheck) {
        preCheck();
      });

      helpers.model.generateFile(args);
      helpers.migration.generateTableCreationFile(args);
    }
  }
};
