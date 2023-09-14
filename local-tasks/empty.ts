(function() {
  const gulp = requireModule<Gulp>("gulp");
  gulp.task("empty", () => {
    return Promise.resolve();
  });
})();
