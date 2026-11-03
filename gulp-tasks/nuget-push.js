"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_step_1 = require("exec-step");
(function () {
    const versionRe = /^(?<id>[A-Za-z0-9.]+?)\.(?<version>\d+\.\d+\.\d+(?:\.\d+)?)(-(?<tag>.*))?\.nupkg$/;
    function parseFileVersionInfo(fileName) {
        var _a;
        const groups = (_a = fileName.match(versionRe)) === null || _a === void 0 ? void 0 : _a.groups;
        if (!groups) {
            throw new Error(`Unable to determine version info from file name: '${fileName}'`);
        }
        const { id, version, tag } = groups, versionNumbers = version.split(".").map(Number);
        while (versionNumbers.length < 4) {
            versionNumbers.push(0);
        }
        return {
            id,
            version: versionNumbers,
            tag
        };
    }
    function compareVersions(a, b) {
        const x = parseFileVersionInfo(a), y = parseFileVersionInfo(b);
        for (let i = 0; i < 4; i++) {
            if (x.version[i] !== y.version[i]) {
                return x.version[i] - y.version[i];
            }
        }
        if (x.tag === y.tag) {
            return 0;
        }
        if (x.tag === undefined) {
            return 1;
        }
        if (y.tag === undefined) {
            return -1;
        }
        return x.tag.localeCompare(y.tag, undefined, { numeric: true });
    }
    gulp.task("nuget-push", "Pushes the latest versions of packages in the package build dir", async () => {
        const { system } = require("system-wrapper"), { ctx } = require("exec-step"), debug = requireModule("debug")(__filename), path = require("path"), nugetPush = requireModule("nuget-push"), { ls, FsEntities } = require("yafs"), env = requireModule("env"), folder = env.resolve(env.PACK_TARGET_FOLDER), packages = await ls(folder, {
            recurse: false,
            entities: FsEntities.files,
            match: /\.nupkg$/
        });
        if (packages.length === 0) {
            throw new Error(`No .nupkg files found in ${path.resolve(folder)}`);
        }
        const unparseable = packages.filter(p => !versionRe.test(p));
        if (unparseable.length > 0) {
            throw new Error(`Unable to determine package id / version from: ${unparseable.join(", ")}`);
        }
        const sorted = [...packages].sort((a, b) => compareVersions(b, a)), seen = new Set(), toPush = [];
        for (const file of sorted) {
            const { id } = parseFileVersionInfo(file);
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
                        throw new exec_step_1.ExecStepOverrideMessage(`${path.basename(file)} NOT pushed: this version already exists at the registry.`, undefined, false);
                    }
                }
            });
        }
    });
    const conflictMarkers = [
        /already been pushed/i,
        /conflict\s+http/i,
        /\b409\b.*\bconflict\b/i
    ];
    function looksLikeNugetConflict(result) {
        return result.stderr
            .concat(result.stdout)
            .some(line => conflictMarkers.some(marker => marker.test(line)));
    }
})();
