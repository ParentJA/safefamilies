var gulp = require("gulp");
var addStream = require("add-stream");
var angularTemplateCache = require("gulp-angular-templatecache");
var concat = require("gulp-concat");

function prepareTemplates() {
  // Compile templates and write to dist.
  return gulp.src(["./app/src/**/*.html", "!./app/src/index.html"])
    .pipe(angularTemplateCache());
}

gulp.task("index", function () {
  // Copy index to dist.
  return gulp.src("./app/src/index.html")
    .pipe(gulp.dest("app/dist/"));
});

gulp.task("app-styles", function () {
  // Compile styles and write to dist.
  return gulp.src("./app/src/**/*.css")
    .pipe(concat("./app-styles.css"))
    .pipe(gulp.dest("./app/dist/styles/"));
});

gulp.task("vendor-styles", function () {
  // Compile styles and write to dist.
  return gulp.src([
      "./bower_components/bootswatch/lumen/bootstrap.css",
      "./bower_components/angular-bootstrap/ui-bootstrap-csp.css",
      "./bower_components/font-awesome/css/font-awesome.css"
    ])
    .pipe(concat("./vendor-styles.css"))
    .pipe(gulp.dest("./app/dist/styles/"));
});

gulp.task("app-scripts", function () {
  // Compile scripts and write to dist.
  return gulp.src("./app/src/**/*.js")
    .pipe(addStream.obj(prepareTemplates()))
    .pipe(concat("./app-scripts.js"))
    .pipe(gulp.dest("./app/dist/scripts/"));
});

gulp.task("vendor-scripts", function () {
  // Compile scripts and write to dist.
  return gulp.src([
      "./bower_components/jquery/dist/jquery.js",
      "./bower_components/bootstrap/dist/js/bootstrap.js",
      "./bower_components/lodash/dist/lodash.js",
      "./bower_components/moment/moment.js",
      "./bower_components/angular/angular.js",
      "./bower_components/angular-cookies/angular-cookies.js",
      "./bower_components/angular-ui-router/release/angular-ui-router.js",
      "./bower_components/example-accounts/example-accounts.js",
      "./bower_components/angular-bootstrap/ui-bootstrap.js",
      "./bower_components/angular-bootstrap/ui-bootstrap-tpls.js"
    ])
    .pipe(concat("./vendor-scripts.js"))
    .pipe(gulp.dest("./app/dist/scripts/"));
});

gulp.task("vendor-fonts", function () {
  // Copy fonts to dist.
  return gulp.src(["./bower_components/font-awesome/fonts/fontawesome-webfont.*"])
    .pipe(gulp.dest("./app/dist/fonts/"));
});

gulp.task("default", ["index", "app-styles", "vendor-styles", "app-scripts", "vendor-scripts", "vendor-fonts"]);