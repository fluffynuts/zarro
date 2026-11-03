"use strict";
(function () {
    async function commitAll(where, comment, dryRun) {
        const log = requireModule("log"), { simpleGit } = require("simple-git");
        if (dryRun) {
            log.info(`would add & commit all from: ${where}`);
        }
        else {
            const git = simpleGit(where || ".");
            await git.add(":/");
            await git.commit(comment);
        }
    }
})();
