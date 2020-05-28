"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Git = require("simple-git/promise"), gutil = requireModule("gulp-util"), spawn = requireModule("spawn"), gulp = requireModule("gulp-with-help"), gitTag = requireModule("git-tag"), gitPushTags = requireModule("git-push-tags"), gitPush = requireModule("git-push"), env = requireModule("env"), readPackageVersion = requireModule("read-package-version");
function log(str) {
    gutil.log(gutil.colors.green(str));
}
async function tryPublish(dryRun) {
    if (dryRun) {
        log("would publish...");
    }
    else {
        await spawn("npm", ["publish"]);
    }
}
async function commitAll(dryRun, where, comment) {
    if (dryRun) {
        log(`would add & commit all from: ${where}`);
    }
    else {
        const git = new Git(where || ".");
        await git.add(":/");
        await git.commit(comment);
    }
}
async function tagAndPush(dryRun, tag, where) {
    await gitTag({
        tag,
        dryRun,
        where
    });
    await gitPush({
        dryRun,
        where
    });
    await gitPushTags({
        dryRun,
        where
    });
}
gulp.task("release", ["increment-package-json-version"], async () => {
    const dryRun = env.resolveFlag("DRY_RUN");
    await tryPublish(dryRun);
    await tagRelease(dryRun);
});
gulp.task("tag-release", async () => {
    const dryRun = env.resolveFlag("DRY_RUN");
    await tagRelease(dryRun);
});
async function tagRelease(dryRun) {
    const version = await readPackageVersion(), tag = `v${version}`;
    // must commit all of gulp-tasks first so the updated module ends up committed with zarro
    await commitAll(dryRun, "gulp-tasks", `:bookmark: goes with zarro v${version}`);
    await commitAll(dryRun, ".", ":bookmark: bump package version");
    // can tag and push in parallel
    await Promise.all([
        tagAndPush(dryRun, tag, "."),
        tagAndPush(dryRun, tag, "gulp-tasks")
    ]);
}
