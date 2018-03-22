var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var webserver = require('gulp-webserver');
 

var paths = {
    pages: ['src/*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["copy-html"], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts'],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('blazing-fruits.js'))
        .pipe(gulp.dest("dist"));
});

gulp.task('run', function() {
    return gulp.src('dist')
      .pipe(webserver({
        host: '0.0.0.0',
        port: 8080,
        livereload: true,
        open: true,
        fallback: './dist/index.html'
      }));
  });