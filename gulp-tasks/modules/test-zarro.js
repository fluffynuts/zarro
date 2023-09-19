"use strict";
(function () {
    const packageLookup = {
        [`local`]: undefined,
        [`beta`]: "zarro@beta",
        [`latest`]: "zarro@latest"
    }, readPackageJson = requireModule("read-package-json");
    async function testZarro(opts) {
        const log = requireModule("log"), system = requireModule("system");
        if (!opts) {
            throw new Error(`no options provided`);
        }
        const tasks = opts.tasks;
        if (!tasks) {
            throw new Error(`'tasks' not defined on options`);
        }
        const taskArray = Array.isArray(tasks)
            ? tasks
            : [tasks];
        const toInstall = packageLookup[opts.packageVersion];
        if (toInstall) {
            await system("npm", ["install", "--no-save", toInstall]);
            const installedPackageIndex = await readPackageJson("node_modules/zarro/package.json");
            console.warn(`Running tests with zarro@${installedPackageIndex.version}`);
        }
        try {
            for (const task of taskArray) {
                await system("npm", ["run", task]);
            }
        }
        catch (e) {
            log.error(`test run fails:\n${e}`);
        }
        finally {
            if (opts.rollback) {
                await system("git", ["reset", "--hard"]);
            }
        }
    }
    module.exports = testZarro;
})();
