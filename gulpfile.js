var gulp        = require('gulp')
  , gutil       = require('gulp-util')
  , help        = require('gulp-help')
  , path        = require('path')
  , packageJson = require(path.resolve(__dirname, 'package.json'))
  , noop        = function(){}

help(gulp, { aliases: ['h'] })

gulp.task('version', 'Prints the version number.', [], function() {
  console.log(packageJson.version)
}, {
  aliases: ['v']
})

gulp.task('init', 'Initializes the project.', function() {

})

gulp.task('migrate', 'Run pending migrations.', function() {

})

gulp.task('migrate:undo', 'Undo the last migration.', function() {

})

gulp.task('migration:create', 'Creates a new migration.', function() {

})
