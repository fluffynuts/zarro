"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Git = require("simple-git/promise"), spawn = requireModule("spawn"), gulp = requireModule("gulp-with-help"), gitTag = requireModule("git-tag"), gitPushTags = requireModule("git-push-tags"), gitPush = requireModule("git-push"), env = requireModule("env"), readPackageVersion = requireModule("read-package-version");
gulp.task("release", ["increment-package-json-version"], async () => {
    const dryRun = env.resolveFlag("DRY_RUN"), git = new Git();
    const version = await readPackageVersion();
    if (dryRun) {
        return;
    }
    await git.add(":/");
    await git.commit(":bookmark: bump package version");
    await gitTag(`v${version}`);
    await spawn("npm", ["publish"]);
    await gitPush(dryRun);
    await gitPushTags(dryRun);
});
