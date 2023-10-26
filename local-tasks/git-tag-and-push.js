"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gitFactory = require("simple-git"), gutil = requireModule("gulp-util"), gulp = requireModule("gulp"), gitTag = requireModule("git-tag"), gitPushTags = requireModule("git-push-tags"), gitPush = requireModule("git-push"), env = requireModule("env"), readPackageVersion = requireModule("read-package-version");
function log(str) {
    gutil.log(gutil.colors.green(str));
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
gulp.task("git-tag-and-push", async () => {
    const dryRun = env.resolveFlag("DRY_RUN");
    await tagRelease(dryRun);
});

async function tagRelease(dryRun) {
    const version = await readPackageVersion(), tag = `v${version}`;
    await commitAll(dryRun, ".", ":bookmark: bump package version");
    // can tag in parallel
    await gitTag({
        tag,
        dryRun,
        where: "."
    });
    // can push in parallel, if it's quick enough so that the GH action doesn't
    // fail to get the submodule...
    await push(dryRun, ".");
}
