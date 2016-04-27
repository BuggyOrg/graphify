var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var gulpCopy = require('gulp-copy')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var watchify = require('watchify')

function compile (watch) {
  var bundler = browserify('./src/layout.js', { debug: true }).transform('babelify', {presets: ['es2015']})

  bundler.bundle()
    .on('error', function (err) { console.error(err); this.emit('end') })
    .pipe(source('layout.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./app'))
}

function watch () {
  var bundler = watchify(browserify('./src/layout.js', { debug: true }).transform('babelify', {presets: ['es2015']}))

  function rebundle () {
    bundler.bundle()
      .on('error', function (err) { console.error(err); this.emit('end') })
      .pipe(source('layout.js'))
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

gulp.task('copy-deps', function() {
  return gulp.src(['./node_modules/d3/d3.min.js',
                   './node_modules/klayjs/klay.js',
                   './node_modules/d3-measure-text/lib/d3-measure-text.js'])
    .pipe(gulpCopy('app/lib', {prefix: 1000}))
})

gulp.task('build-js', function () { return compile() })
gulp.task('watch-js', function () { return watch() })

gulp.task('build', ['build-js', 'copy-deps'])
gulp.task('watch', ['watch-js', 'copy-deps'])

gulp.task('default', ['build'])
