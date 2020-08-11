(function() {
  const gulp = requireModule<Gulp>("gulp");

  gulp.task("verify-submodules", [ "verify-gulp-tasks" ], () => Promise.resolve());
})();
