"use strict";

var gulp   = require("gulp");
var jshint = require("gulp-jshint");
var mocha  = require("gulp-mocha");
var path   = require("path");
var args   = require("yargs").argv;

gulp.task("default", ["lint", "test"], function () {});

gulp.task("lint", function () {
  gulp
    .src([
      path.resolve(__dirname, "gulpfile.js"),
      path.resolve(__dirname, "lib", "*.js"),
      path.resolve(__dirname, "lib", "helpers", "*.js"),
      path.resolve(__dirname, "lib", "tasks", "*.js")
    ])
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

gulp.task("test", function () {
   gulp
      .src(path.resolve(__dirname, "test", "**", "*.test.js"), { read: false })
      .pipe(mocha({
        reporter:    "spec",
        ignoreLeaks: true,
        timeout:     10000,
        grep:        args.grep
      }));
});
