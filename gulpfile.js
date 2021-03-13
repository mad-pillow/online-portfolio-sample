// Issue files' paths
const projectFolder = 'dist';
const sourceFolder = 'app';
const path = {
   build: {
      html: projectFolder + '/',
      css: projectFolder + '/css/',
      js: projectFolder + '/js/',
      img: projectFolder + '/images/',
      fonts: projectFolder + '/fonts/',
      icons: projectFolder + '/iconsprite/',
      fav: projectFolder + '/favicon/',
   },
   source: {
      html: sourceFolder + '/',
      css: sourceFolder + '/scss/',
      js: sourceFolder + '/js/',
      img: sourceFolder + '/images/',
      fonts: sourceFolder + '/fonts/',
      icons: sourceFolder + '/icons/',
      fav: sourceFolder + '/favicon/',
   },
};

// Attach gulp modules
const gulp = require('gulp');
const concat = require('gulp-concat');
const jsFiles = [path.source.js + 'goup.js', path.source.js + 'main.js'];
const htmlFiles = [path.source.html + '*.html', '!' + path.source.html + '_*.html'];
const cleanCSS = require('gulp-clean-css');
const cleanCSSlevel = 2; //0,1,2
const del = require('del');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const fileInclude = require('gulp-file-include');
const groupMedia = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const scss = require('gulp-sass');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2woff = require('gulp-ttf2woff');

//Task for CSS
gulp.task('styles', function () {
   return gulp
      .src(path.source.css + 'style.scss')
      .pipe(scss({ outputStyle: 'expanded' }))
      .pipe(groupMedia())
      .pipe(autoprefixer({ overrideBrowserslist: ['last 5 versions'], cascade: true }))
      .pipe(gulp.dest(path.build.css))
      .pipe(cleanCSS({ level: cleanCSSlevel }))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest(path.build.css))
      .pipe(browserSync.stream());
});

//Task for JS
gulp.task('scripts', function () {
   return gulp.src(jsFiles).pipe(concat('script.js')).pipe(gulp.dest(path.build.js)).pipe(browserSync.stream());
});

//Task for HTML
gulp.task('html', function () {
   return gulp.src(htmlFiles).pipe(fileInclude()).pipe(gulp.dest(path.build.html)).pipe(browserSync.stream());
});

//Task for cleaning folders
gulp.task('del', function () {
   return del([projectFolder + '/**', projectFolder + '!.gitignore', projectFolder + '!.git']);
});

//Task for cleaning fonts
gulp.task('delFonts', function () {
   return del([path.build.fonts + '*']);
});

//Get smaller images
gulp.task('img-compress', function () {
   return gulp
      .src(path.source.img + '**')
      .pipe(gulp.dest(path.build.img))
      .pipe(gulp.src(path.source.img + '**'))
      .pipe(
         imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 2,
            svgoPlugins: [
               {
                  removeViewBox: false,
               },
            ],
         }),
      )
      .pipe(gulp.dest(path.build.img));
});

gulp.task('fontscopy', function () {
   return gulp.src(path.source.fonts + '*.ttf').pipe(gulp.dest(path.build.fonts));
});

//Get favicons
gulp.task('favicons', function () {
   return gulp.src(path.source.fav + '**').pipe(gulp.dest(path.build.fav));
});

//Watch changes
gulp.task('watch', function () {
   browserSync.init({
      server: {
         baseDir: projectFolder,
         notify: false,
      },
   });
   //Watch CSS changes
   gulp.watch(path.source.css + '**/*.scss', gulp.series('styles'));
   //Watch JS changes
   gulp.watch(path.source.js + '**/*.js', gulp.series('scripts'));
   //Watch HTML changess
   gulp.watch(path.source.html + '*.html', gulp.series('html'));
   gulp.watch(path.source.html + '*.html').on('change', browserSync.reload);
   //Watch new images
   gulp.watch(path.source.img + '**', gulp.series('img-compress'));
   //Watch new favicons
   gulp.watch(path.source.fav + '**', gulp.series('favicons'));
   //Watch new fonts
   gulp.watch(path.source.fonts + '**', gulp.series('delFonts', 'fontscopy', 'fonts'));
});

//Work with fonts
gulp.task('fonts', function () {
   gulp
      .src(path.source.fonts + '*.ttf')
      .pipe(ttf2woff())
      .pipe(gulp.dest(path.build.fonts));
   return gulp
      .src(path.source.fonts + '*.ttf')
      .pipe(ttf2woff2())
      .pipe(gulp.dest(path.build.fonts));
});

gulp.task(
   'default',
   gulp.series(
      'del',
      'fonts',
      'fontscopy',
      'favicons',
      gulp.parallel('styles', 'html', 'scripts', 'img-compress'),
      'watch',
   ),
);
