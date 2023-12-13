"use strict";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("transpile-local-tasks", () => {
        console.log("(this is a dummy task to force local task transpilation)");
        return Promise.resolve();
    });
})();
