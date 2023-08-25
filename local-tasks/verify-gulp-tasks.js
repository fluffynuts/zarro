"use strict";
// import path from "path";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("verify-gulp-tasks", async () => {
        const gitFactory = require("simple-git"), path = require("path");
        try {
            if (process.env.RUNNING_IN_GITHUB_ACTION) {
                return;
            }
            const at = path.resolve(path.join(__dirname, "..", "gulp-tasks")), git = gitFactory(at), expected = "master", branchInfo = await git.branch();
            if (!branchInfo || branchInfo.current !== expected) {
                const err = `Expected gulp-tasks to be checked out as master`;
                console.error(err);
                throw new Error(err);
            }
        }
        catch (e) {
            console.error(`can't verify gulp-tasks: ${e.toString()}`);
            throw e;
        }
    });
})();
