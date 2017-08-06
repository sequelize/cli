

const helpers = require(__dirname);
const _       = require('lodash');
const clc     = require('cli-color');

const config = helpers.config.init();

module.exports = {
  addTask (gulp, taskName, task) {
    gulp.task(
      taskName,
      task.descriptions.short,
      task.dependencies || [],
      () => {
        return config.then(() => {
          return task.task();
        });
      }, {
        aliases: task.aliases || []
      }
    );
  },

  addHelp (gulp, taskName, task) {
    const self = this;

    gulp.task(
      'help:' + taskName,
      false,
      () => {
        return config.then(() => {
          Object.keys(task.descriptions).forEach(description => {
            if (typeof task.descriptions[description] === 'function') {
              task.descriptions[description] = task.descriptions[description]();
            }
          });
          helpers.view.log(clc.bold('COMMANDS'));

          const commands      = [ taskName ].concat(task.aliases || []);
          const commandMargin = Math.max.apply(null, commands.map(c => {
            return c.length;
          }));

          commands.forEach(command => {
            const s = [
              'sequelize', command + new Array(commandMargin - command.length + 1).join(' '),
              '--', task.descriptions.short
            ].join(' ');

            helpers.view.log('    ' + s);
          });
          helpers.view.log();

          helpers.view.log(clc.bold('DESCRIPTION'));

          (task.descriptions.long || [task.descriptions.short]).forEach(line => {
            helpers.view.log('    ' + line);
          });

          (function (options) {
            if (options) {
              const margin = Math.max.apply(null, Object.keys(options).map(o => {
                return o.length;
              }));

              helpers.view.log();
              helpers.view.log(clc.bold('OPTIONS'));

              Object.keys(options).forEach(option => {
                const args = ['   ', option];

                args.push(new Array(margin - option.length + 1).join(' '));
                args.push(options[option]);

                helpers.view.log.apply(helpers.view, args);
              });
            }
          })(_.assign(self.getGlobalOptions(), task.descriptions.options));

          helpers.view.log();
        });
      }
    );
  },

  getGlobalOptions () {
    return {
      '--env': 'The environment to run the command in. ' +
        clc.blueBright('Default: development'),
      '--coffee': 'Enables coffee script support. ' +
        clc.blueBright('Default: false'),
      '--config': 'The path to the config file. ' +
        clc.blueBright('Default: config/config.json'),
      '--options-path': 'The path to a JSON file with additional options. ' +
        clc.blueBright('Default: none'),
      '--migrations-path': 'The path to the migrations folder. ' +
        clc.blueBright('Default: migrations'),
      '--seeders-path': 'The path to the seeders folder. ' +
        clc.blueBright('Default: seeders'),
      '--models-path': 'The path to the models folder.' +
        clc.blueBright('Default: models'),
      '--url': 'The database connection string to use. Alternative to using --config files. ' +
        clc.blueBright('Default: none')
    };
  },

  printManuals (tasks) {
    const manuals = Object.keys(tasks).filter(name => {
      return name.indexOf('help:') === 0;
    }).sort();
    const margin  = manuals.reduce((m, taskName) => {
      return m > taskName.length ? m : taskName.length;
    }, 0);

    console.log('Available manuals');

    manuals.forEach(name => {
      const args = [' ', name];

      args.push(new Array(margin - name.length + 1).join(' '));
      args.push('The documentation for "sequelize ' + name.replace('help:', '') + '".');

      console.log.apply(console, args);
    });

    console.log();
  }
};
