(function() {
  const gulp = requireModule<Gulp>("gulp");

  gulp.task("verify-submodules", [ "verify-externals", "verify-gulp-tasks" ], () => Promise.resolve());
})();
