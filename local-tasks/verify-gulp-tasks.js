"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const gulp = requireModule("gulp");
    gulp.task("verify-gulp-tasks", async () => {
        const { simpleGit } = require("simple-git"), path = require("path");
        const rootGit = simpleGit(".");
        const status = (await rootGit.status());
        if (status.current !== "master") {
            console.warn("Running in a branch - not verifying gulp-tasks branch to be master");
            return;
        }
        try {
            if (process.env.RUNNING_IN_GITHUB_ACTION) {
                return;
            }
            const at = path.resolve(path.join(__dirname, "..", "gulp-tasks")), git = simpleGit(at), expected = "master", branchInfo = await git.branch();
            if (!branchInfo || branchInfo.current !== expected) {
                const err = `Expected gulp-tasks to be checked out as master`;
                console.error(err);
                // noinspection ExceptionCaughtLocallyJS
                throw new Error(err);
            }
        }
        catch (e) {
            console.error(`can't verify gulp-tasks: ${e.toString()}`);
            throw e;
        }
    });
})();
