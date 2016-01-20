var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var autoprefixer = require('gulp-autoprefixer');
var nunjucksRender = require('gulp-nunjucks-render');


gulp.task('sass', function() {
    return gulp.src('app/styles/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('watch', ['browserSync', 'sass', 'nunjucks'], function() {
    gulp.watch('app/styles/**/*.scss', ['sass']);
    gulp.watch('app/templates/**/*.nunjucks', ['nunjucks']);
    gulp.watch('app/pages/**/**.html', ['nunjucks']);
    gulp.watch('app/*.html', browserSync.reload);
    gulp.watch('app/scripts/**/*.js', browserSync.reload);
});

gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: ['.tmp', 'app']
        }
    })
});

gulp.task('html', ['sass'], function() {

    return gulp.src('app/*.html')
        .pipe(useref({searchPath: ['.tmp', 'app']}))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'))
});

gulp.task('images', function() {
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
        .pipe(imagemin({
            interlaced: true
        }))
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function() {
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
});

gulp.task('nunjucks', function() {
    nunjucksRender.nunjucks.configure(['app/templates/']);

    return gulp.src('app/pages/**/*.+(html|nunjucks)')
        .pipe(nunjucksRender())
        .pipe(gulp.dest('app'))
});

gulp.task('clean:dist', function() {
    return del.sync('dist');
});

gulp.task('build', function (callback) {
    runSequence('clean:dist', 'nunjucks',
        ['html', 'images', 'fonts'],
        callback
    )
});