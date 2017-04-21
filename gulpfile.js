var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var watchify = require('watchify')

function compile (watch) {
  var bundler = browserify('./src/index.js', { debug: true }).transform('babelify', {presets: ['es2015']})

  bundler.bundle()
    .on('error', function (err) { console.error(err); this.emit('end') })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app'))
}

function watch () {
  var bundler = watchify(browserify('./src/index.js', { debug: true }).transform('babelify', {presets: ['es2015']}))

  function rebundle () {
    bundler.bundle()
      .on('error', function (err) { console.error(err); this.emit('end') })
      .pipe(source('index.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./app'))
  }

  if (watch) {
    bundler.on('update', function () {
      console.log('-> bundling...')
      rebundle()
    })
  }

  rebundle()
}

gulp.task('build-js', function () { return compile() })
gulp.task('watch-js', function () { return watch() })

gulp.task('build', ['build-js'])
gulp.task('watch', ['watch-js'])

gulp.task('default', ['build'])
