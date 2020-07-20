"use strict";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("verify-submodules", ["verify-externals", "verify-gulp-tasks"], () => Promise.resolve());
})();
