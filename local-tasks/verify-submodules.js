"use strict";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("verify-submodules", ["verify-gulp-tasks"], () => Promise.resolve());
})();
