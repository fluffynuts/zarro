"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_step_1 = require("exec-step");
(function () {
    gulp.task("nuget-push", "Pushes the latest versions of packages in the package build dir", async () => {
        const system = requireModule("system"), { ctx } = require("exec-step"), debug = requireModule("debug")(__filename), path = require("path"), nugetPush = requireModule("nuget-push"), { ls, FsEntities } = require("yafs"), env = requireModule("env"), folder = env.resolve(env.PACK_TARGET_FOLDER), versionRe = /^(?<id>[A-Za-z\.]+)\.(?<version>\d\.\d\.\d)(-(?<tag>.*))?\.nupkg$/, packages = await ls(folder, {
            recurse: false,
            entities: FsEntities.files,
            match: versionRe
        }), sorted = packages.sort().reverse(), seen = new Set();
        if (sorted.length === 0) {
            throw new Error(`No .nupkg files found in ${path.resolve(folder)}`);
        }
        const toPush = [];
        for (const file of sorted) {
            const match = file.match(versionRe), id = match === null || match === void 0 ? void 0 : match.groups["id"];
            if (seen.has(id)) {
                debug(`already seen ${id}, skipping ${file}`);
                continue;
            }
            seen.add(id);
            toPush.push(file);
        }
        if (env.resolveFlag(env.DRY_RUN)) {
            const log = requireModule("log");
            log.info("DRY_RUN set, would have pushed packages:");
            for (const item of toPush) {
                log.info(`  ${item}`);
            }
            return;
        }
        for (const file of toPush) {
            await ctx.exec(`⬆️ pushing ${file}`, async () => {
                const result = await nugetPush(path.join(folder, file));
                if (system.isError(result)) {
                    throw result;
                }
                if (system.isResult(result)) {
                    const res = result;
                    if (looksLikeNugetConflict(res)) {
                        throw new exec_step_1.ExecStepOverrideMessage(`${path.basename(file)} NOT pushed: this version already exists at the registry.`, new Error('dummy'), false);
                    }
                }
            });
        }
    });
    const conflictMarkers = [
        "409",
        "already been pushed",
        "conflict http"
    ];
    function looksLikeNugetConflict(result) {
        const io = result.stderr
            .concat(result.stdout)
            .map(line => line.toLowerCase());
        for (const line of io) {
            const current = conflictMarkers.reduce((acc, cur) => acc || line.includes(cur), false);
            if (current) {
                return true;
            }
        }
        return false;
    }
})();
