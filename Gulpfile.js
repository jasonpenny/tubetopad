var gulp = require('gulp'),
    del = require('del'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    ngHtml2Js = require('browserify-ng-html2js');

gulp.task('clean', function (cb) {
    del(['app/public'], cb);
});

gulp.task('build-js', ['clean'], function () {
    var b = browserify({
            entries: ['./app/web/app.js']
        }).transform(
            ngHtml2Js()
        );
    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./app/public/js/'));
});

gulp.task('build', ['clean', 'build-js'], function () {
    return gulp.src('./app/web/index.html')
        .pipe(gulp.dest('./app/public/'));
});

gulp.task('default', ['build']);
