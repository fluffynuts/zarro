"use strict";
(function () {
    const { ls, FsEntities } = require("yafs"), gulp = requireModule("gulp");
    gulp.task("upgrade-packages", async () => {
        const env = requireModule("env"), { upgradePackages } = requireModule("dotnet-cli"), rawPackageMask = env.resolveArray(env.UPGRADE_PACKAGES), packageMask = parseMasks(rawPackageMask, true), rawTargetMask = env.resolveArray(env.UPGRADE_PACKAGES_TARGET), nugetSource = env.resolve(env.NUGET_SOURCE), showProgress = env.resolveFlag(env.UPGRADE_PACKAGES_PROGRESS), preRelease = env.resolveFlag(env.UPGRADE_PACKAGES_PRERELEASE), noRestore = env.resolveFlag(env.UPGRADE_PACKAGES_NO_RESTORE), targets = await resolveTargets(rawTargetMask);
        for (const target of targets) {
            await upgradePackages({
                source: nugetSource,
                showProgress: showProgress,
                packages: packageMask,
                pathToProjectOrSolution: target,
                preRelease: preRelease,
                noRestore: noRestore
            });
        }
    });
    const solutionRe = /.*\.sln$/i, projectRe = /.*\.csproj$/i;
    async function resolveTargets(rawTargets) {
        if (!rawTargets || rawTargets.length === 0) {
            return await findSolutions();
        }
        const regexTargets = parseMasks(rawTargets, false);
        const interestingFiles = await findFiles([
            solutionRe,
            projectRe
        ]);
        return interestingFiles.filter(filepath => {
            for (const re of regexTargets) {
                if (re.test(filepath)) {
                    return true;
                }
            }
            return false;
        });
    }
    async function findSolutions() {
        return await findFiles([solutionRe]);
    }
    async function findFiles(match) {
        return await ls(".", {
            entities: FsEntities.files,
            match,
            recurse: true,
            fullPaths: true,
            doNotTraverse: [/node_modules/]
        });
    }
    function parseMasks(masks, strict) {
        // package masks can be raw strings or strings representing regular expressions
        return masks.map(s => looksLikeRegex(s)
            ? new RegExp(s)
            : looksLikeAGlob(s)
                ? createRegExpFromGlob(s)
                : makeRegex(s, strict));
    }
    function makeRegex(s, strict) {
        const escaped = s.replace(".", "\\.");
        return strict
            ? new RegExp(`/^${escaped}$/i`)
            : new RegExp(`/${escaped}/i`);
    }
    function createRegExpFrom(s) {
        if (s.endsWith('/')) {
            s += "i"; // make case-insensitive by default
        }
        return new RegExp(s);
    }
    function looksLikeAGlob(s) {
        return s.includes("*");
    }
    function createRegExpFromGlob(str) {
        return createRegExpFrom(str.replace(/\.\*/, "\\.*"));
    }
    function looksLikeRegex(s) {
        return !!s && // defend against null and undefined
            s.length > 2 && // must have at least 2 slashes
            s.startsWith('/') && // must start with a slash
            s.substring(1).includes('/'); // must have another slash somewhere (doesn't have to be the end because the caller can do /i (we'll do that automatically if not)
    }
})();
