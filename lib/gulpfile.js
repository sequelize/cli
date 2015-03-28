"use strict";

var gulp    = require("gulp");
var path    = require("path");
var fs      = require("fs");
var helpers = require(path.resolve(__dirname, "helpers"));

// Enables ES6 by babel.
if (helpers.config.supportsES6()) {
  var babel = helpers.path.resolve("babel/register");
  if (!babel) {
    console.log("Unable to find \"babel\". Please add it to your project.");
    process.exit(1);
  }
  var rcPath = path.resolve(process.cwd(), ".babelrc");
  if (fs.existsSync(rcPath)) {
    babel(JSON.parse(fs.readFileSync(rcPath)));
  }
}

require("gulp-help")(gulp, {
  aliases: ["h"],
  afterPrintCallback: helpers.gulp.printManuals
});

fs
  .readdirSync(path.resolve(__dirname, "tasks"))
  .filter(function (file) {
    return (file.indexOf(".") !== 0);
  })
  .map(function (file) {
    return require(path.resolve(__dirname, "tasks", file));
  })
  .forEach(function (tasks) {
    Object.keys(tasks).forEach(function (taskName) {
      helpers.gulp.addTask(gulp, taskName, tasks[taskName]);
      helpers.gulp.addHelp(gulp, taskName, tasks[taskName]);
    });
  });
