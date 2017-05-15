var gulp  = require('gulp');
var typescript = require('gulp-tsc');
var less = require('gulp-less');
 
gulp.task('less', function () {
  return gulp.src('app/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('build'));
});

gulp.task('compile', function(){
  gulp.src(['app/**/*.ts'])
    .pipe(typescript())
    .pipe(gulp.dest('build/'))
});

gulp.task('copy', function() {
  gulp.src('app/views/*.html').pipe(gulp.dest('build/controllers'));
  gulp.src('app/**/*.js').pipe(gulp.dest('build'));
});

gulp.task('default', ['copy', 'less']);