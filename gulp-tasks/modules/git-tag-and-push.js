"use strict";
(function () {
    const env = requireModule("env");
    async function gitTagAndPush(tag, dryRun) {
        const gitTag = requireModule("git-tag"), gitPushTags = requireModule("git-push-tags"), gitPush = requireModule("git-push");
        if (!tag) {
            tag = env.resolveRequired(env.GIT_TAG);
        }
        if (dryRun === undefined) {
            dryRun = env.resolveFlag(env.DRY_RUN);
        }
        await gitTag({
            tag,
            dryRun
        });
        await gitPush(dryRun);
        await gitPushTags(dryRun);
    }
    module.exports = gitTagAndPush;
})();
