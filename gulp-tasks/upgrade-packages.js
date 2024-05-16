"use strict";
(function () {
    const { ls, FsEntities, fileExistsSync } = require("yafs"), gulp = requireModule("gulp");
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
        const exactMatches = rawTargets.filter(t => {
            return fileExistsSync(t);
        });
        const inexactMatches = rawTargets.filter(s => exactMatches.indexOf(s) === -1);
        const regexTargets = parseMasks(inexactMatches, false);
        if (regexTargets.length === 0) {
            return exactMatches;
        }
        const interestingFiles = await findFiles([
            solutionRe,
            projectRe
        ]);
        return [
            ...exactMatches,
            ...interestingFiles.filter(filepath => {
                for (const re of regexTargets) {
                    if (re.test(filepath)) {
                        return true;
                    }
                }
                return false;
            })
        ];
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
            ? makeCaseInsensitiveRegex(s)
            : looksLikeAGlob(s)
                ? createRegExpFromGlob(s)
                : makeRegex(s, strict));
    }
    function makeCaseInsensitiveRegex(s) {
        const parts = s.split("/"), hasEnoughParts = parts.length >= 3;
        if (!hasEnoughParts) {
            return new RegExp(s, "i");
        }
        const startsWithSlash = parts[0] === "", endsWithSlash = parts[parts.length - 1] === "", finalSlashIsEscaped = hasEnoughParts && parts[parts.length - 2].endsWith("\\"), isEz = startsWithSlash && endsWithSlash && !finalSlashIsEscaped;
        if (isEz) {
            let re = s;
            if (startsWithSlash) {
                re = re.substring(1);
            }
            if (endsWithSlash) {
                re = re.substring(0, re.length - 1);
            }
            return new RegExp(re, "i");
        }
        const bitsInTheMiddle = parts.slice(1, parts.length - 2), rejoined = bitsInTheMiddle.join("/");
        return new RegExp(rejoined, "i");
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
