var helpers = require(__dirname)

module.exports = {
  addTask: function(gulp, taskName, task) {
    gulp.task(
      taskName,
      task.descriptions.short,
      task.dependencies || [],
      function() {
        helpers.view.teaser()
        task.task()
      }, {
        aliases: task.aliases || []
      }
    )
  },

  addHelp:function(gulp, taskName, task) {
    gulp.task(
      "help:" + taskName,
      false,
      function() {
        helpers.view.teaser()

        helpers.view.log("Help for " + taskName)
        helpers.view.log()

        if (task.descriptions.long) {
          task.descriptions.long.forEach(function(line) { helpers.view.log(line) })
        } else {
          helpers.view.log(task.descriptions.short)
        }

        (function(options) {
          if (options) {
            var margin = Object.keys(options).reduce(function(m, option) {
              return (m > option.length) ? m : option.length;
            }, 0);

            helpers.view.log()
            helpers.view.log('Options for ' + taskName)
            helpers.view.log()
          }

          Object.keys(options || {}).forEach(function(option) {
            var args = [option]
            args.push(new Array(margin - option.length + 1).join(" "))
            args.push(options[option])
            helpers.view.log.apply(helpers.view, args);
          })
        })(task.descriptions.options)
      }
    )
  },

  printManuals: function(tasks) {
    var manuals = Object.keys(tasks).filter(function(name) { return name.indexOf('help:') === 0 }).sort()
      , margin  = manuals.reduce(function(m, taskName) { return (m > taskName.length) ? m : taskName.length }, 0)

    console.log("Available manuals")

    manuals.forEach(function(name) {
      var args = [' ', name]

      args.push(new Array(margin - name.length + 1).join(" "));
      args.push("The documentation for 'sequelize " + name.replace('help:', '') + "'.");

      console.log.apply(console, args);
    })
  }
}
