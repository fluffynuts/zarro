"use strict";
(function () {
    async function commitAll(where, comment, dryRun) {
        const log = requireModule("log"), gitFactory = require("simple-git");
        if (dryRun) {
            log.info(`would add & commit all from: ${where}`);
        }
        else {
            const git = gitFactory(where || ".");
            await git.add(":/");
            await git.commit(comment);
        }
    }
})();
