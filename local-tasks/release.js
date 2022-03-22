"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gitFactory = require("simple-git"), gutil = requireModule("gulp-util"), spawn = requireModule("spawn"), gulp = requireModule("gulp"), gitTag = requireModule("git-tag"), gitPushTags = requireModule("git-push-tags"), gitPush = requireModule("git-push"), env = requireModule("env"), readPackageVersion = requireModule("read-package-version");
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
        const git = gitFactory(where || ".");
        await git.add(":/");
        await git.commit(comment);
    }
}
async function push(dryRun, where) {
    await gitPush({
        dryRun,
        where
    });
    await gitPushTags({
        dryRun,
        where
    });
}
gulp.task("release", [
    "increment-package-json-version"
], async () => {
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
    // can tag in parallel
    await Promise.all([
        gitTag({
            tag,
            dryRun,
            where: "."
        }),
        gitTag({
            tag,
            dryRun,
            where: "gulp-tasks"
        }),
    ]);
    // can push in parallel
    await Promise.all([
        push(dryRun, "."),
        push(dryRun, "gulp-tasks")
    ]);
}
