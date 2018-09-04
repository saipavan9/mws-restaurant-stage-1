const gulp = require('gulp');
const responsive   = require('gulp-responsive-images');
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer')
const babel        = require('gulp-babel');
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify');
const minifyCSS    = require('gulp-minify-css');
const sourcemaps   = require('gulp-sourcemaps');

const imageRoot    = 'img/**/*';
const styleRoot    = 'sass/**/*.scss';
const scriptRoot   = 'js/**/*.js';

gulp.task('images', function(){
  gulp.src(imageRoot)
      .pipe(responsive({
        '*.jpg': [{
          width: 360,
          quality: 70,
          suffix: '-xsmall'
        },
        {
          width: 520,
          quality: 70,
          suffix: '-small'
        },
        {
          width: 800,
          quality: 70,
          suffix: '-medium'
        },
        {
          width: 1000,
          quality: 70,
          suffix: '-large'
        },
        {
          width: 100,
          percentage: true,
          quality: 70,
          suffix: '-original'
        }]
      }))
      .pipe(gulp.dest('build/img'));
});

gulp.task('styles', function(){
  gulp.src(styleRoot)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
          browsers: ['last 2 versions']
      }))
      .pipe(concat('main.css'))
      .pipe(minifyCSS())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('build/css'))
});

gulp.task('scripts', function(){
  gulp.src(scriptRoot)
      .pipe(sourcemaps.init())
      //.pipe(concat('main.js'))
      .pipe(babel({
          presets: ['env']
      }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('build/js'))
});


gulp.task('default', ['images', 'styles', 'scripts', 'watch']);

gulp.task('watch', function(){
  gulp.watch(scriptRoot, ['scripts']);
  gulp.watch(imageRoot, ['images']);
  gulp.watch(styleRoot, ['styles']);
});
