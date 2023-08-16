(function () {
    var gulp = requireModule("gulp");
    gulp.task("verify-submodules", ["verify-gulp-tasks"], function () { return Promise.resolve(); });
})();
