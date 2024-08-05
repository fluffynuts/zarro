"use strict";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("auto-release-nuget", async () => {
        const env = requireModule("env"), log = requireModule("log"), { runTask } = requireModule("run-task"), Git = require("simple-git"), git = Git("."), branchInfo = await git.branch(), mainBranch = env.resolve(env.GIT_MAIN_BRANCH);
        if (branchInfo.current !== mainBranch) {
            log.info(`auto-releasing beta package: current branch is ${branchInfo.current} and main branch is ${mainBranch}`);
            process.env["BETA"] = "1";
        }
        await runTask("release-nuget");
    });
})();
