'use strict';

var args        = require('yargs').argv;
var gulp        = require('gulp');
var jscs        = require('gulp-jscs');
var jshint      = require('gulp-jshint');
var mdBlock     = require('gulp-markdown-code-blocks');
var mocha       = require('gulp-mocha');
var path        = require('path');
var runSequence = require('run-sequence');

gulp.task('default', function (done) {
  runSequence('lint', 'test', done);
});

gulp.task('test', function (done) {
  runSequence('test-unit', 'test-integration', done);
});

gulp.task('lint', function (done) {
  runSequence('lint-code', 'lint-readme', done);
});

gulp.task('lint-code', function () {
  return gulp
    .src([
      './gulpfile.js',
      './index.js',
      './bin/**/*',
      './lib/**/*.js',
      '!./lib/assets/**/*.js',
      './test/**/*.js',
      '!./test/support/tmp/**/*.js'
    ])
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint-readme', function () {
  return gulp
    .src('./README.md')
    .pipe(mdBlock());
});

gulp.task('test-unit', function () {
  // TODO
});

gulp.task('test-integration', function () {
  gulp
    .src(path.resolve(__dirname, 'test', '**', '*.test.js'), { read: false })
    .pipe(mocha({
      reporter:    'spec',
      ignoreLeaks: true,
      timeout:     10000,
      grep:        args.grep
    }));
});
