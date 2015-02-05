"use strict";

var helpers = require(__dirname);
var _       = require("lodash");
var clc     = require("cli-color");

module.exports = {
  addTask: function(gulp, taskName, task) {
    gulp.task(
      taskName,
      task.descriptions.short,
      task.dependencies || [],
      function() {
        task.task();
      }, {
        aliases: task.aliases || []
      }
    );
  },

  addHelp:function(gulp, taskName, task) {
    var self = this;

    gulp.task(
      "help:" + taskName,
      false,
      function() {
        helpers.view.log(clc.bold("COMMANDS"));

        var commands      = [ taskName ].concat(task.aliases || []);
        var commandMargin = Math.max.apply(null, commands.map(function(c) { return c.length; }));

        commands.forEach(function(command) {
          var s = [
            "sequelize", command + (new Array(commandMargin - command.length + 1).join(" ")),
            "--", task.descriptions.short
          ].join(" ");
          helpers.view.log("    " + s);
        });
        helpers.view.log();

        helpers.view.log(clc.bold("DESCRIPTION"));

        (task.descriptions.long || [task.descriptions.short]).forEach(function(line) {
          helpers.view.log("    " + line);
        });

        (function(options) {
          if (options) {
            var margin = Math.max.apply(null, Object.keys(options).map(function(o) {
              return o.length;
            }));

            helpers.view.log();
            helpers.view.log(clc.bold("OPTIONS"));

            Object.keys(options).forEach(function(option) {
              var args = ["   ", option];

              args.push(new Array(margin - option.length + 1).join(" "));
              args.push(options[option]);

              helpers.view.log.apply(helpers.view, args);
            });
          }
        })(_.assign(self.getGlobalOptions(), task.descriptions.options));

        helpers.view.log();
      }
    );
  },

  getGlobalOptions: function() {
    return {
      "--env": "The environment to run the command in. " +
        clc.blueBright("Default: development"),
      "--coffee": "Enables coffee script support. " +
        clc.blueBright("Default: false"),
      "--config": "The path to the config file. " +
        clc.blueBright("Default: config/config.json"),
      "--options-path": "The path to a JSON file with additional options. " +
        clc.blueBright("Default: none"),
      "--migrations-path": "The path to the migrations folder. " +
        clc.blueBright("Default: migrations"),
      "--models-path": "The path to the models folder." +
        clc.blueBright("Default: models")
    };
  },

  printManuals: function(tasks) {
    var manuals = Object.keys(tasks).filter(function(name) {
      return name.indexOf("help:") === 0;
    }).sort();
    var margin  = manuals.reduce(function(m, taskName) {
      return (m > taskName.length) ? m : taskName.length;
    }, 0);

    console.log("Available manuals");

    manuals.forEach(function(name) {
      var args = [" ", name];

      args.push(new Array(margin - name.length + 1).join(" "));
      args.push("The documentation for 'sequelize " + name.replace("help:", "") + "'.");

      console.log.apply(console, args);
    });

    console.log();
  }
};
