var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var cp = require('child_process');
var sass = require('gulp-sass');

(function() {
  'use strict';

  // Styles task
  gulp.task('styles', function() {
    return gulp.src('./sass/**/*.scss')
      .pipe(sass({
        outputStyle: 'expanded'
      }))
      .pipe(autoprefixer())
      .pipe(gulp.dest('./css'))
      .pipe(browserSync.stream());
  });

  // Serve task - local browser sync server
  gulp.task('serve', ['styles'], function() {
    browserSync.init({
      server: './'
    });

    gulp.watch('./sass/**/*.scss', ['styles']);
    gulp.watch('./*.html').on('change', browserSync.reload);
  });

  // Deploy task - builds and pushes to gh-pages branch
  gulp.task('deploy', ['build'], function() {
    addAll()
      .then(commit)
      .then(push)
      .then(function() {
        console.log('Done');
      })
      .catch(function(err) {
        console.log('Error:', err);
      });

    /**
     * @name addAll
     * @description `git add .` child process.
     */
    function addAll() {
      return new Promise((resolve, reject) => {
        var ps = cp.spawn('git', ['add', '.']);

        ps.stdout.on('data', function(data) { console.log(data.toString()); });
        ps.stderr.on('data', function(data) { console.log(data.toString()); });
        ps.on('close', function(code) {
          code === 0
            ? resolve()
            : reject({
              ok: false,
              code: 500,
              message: 'Failed to add all.'
            });
        });
      });
    }

    /**
     * @name commit
     * @description Commits all changes with timestamp commit message.
     */
    function commit() {
      return new Promise((resolve, reject) => {
        var ts = Date.now();
        var ps = cp.spawn('git', ['commit', '-m', ts]);

        ps.stdout.on('data', function(data) { console.log(data.toString()); });
        ps.stderr.on('data', function(data) { console.log(data.toString()); });
        ps.on('close', function(code) {
          code === 0
            ? resolve()
            : reject({
              ok: false,
              code: 500,
              message: 'Failed to commit.'
            });
        });
      });
    }

    /**
     * @name push
     * @description Pushes all changes to gh-pages branch
     */
    function push() {
      return new Promise((resolve, reject) => {
        var ps = cp.spawn('git', ['push', 'origin', 'gh-pages']);

        ps.stdout.on('data', function(data) { console.log(data.toString()); });
        ps.stderr.on('data', function(data) { console.log(data.toString()); });
        ps.on('close', function(code) {
          code === 0
            ? resolve()
            : reject({
              ok: false,
              code: 500,
              message: 'Failed push changes.'
            });
        });
      });
    }
  });

  // build and default tasks
  gulp.task('build', ['styles']);
  gulp.task('default', ['styles']);
})();
