"use strict";
(function () {
    const { ls, FsEntities, fileExists } = require("yafs"), path = require("path");
    async function resolveNugetPushPackageFiles() {
        const env = requireModule("env"), packRoot = env.resolve(env.PACK_TARGET_FOLDER), pushMask = env.resolveArray(env.NUGET_PUSH_PACKAGES);
        if (pushMask.length === 0) {
            return await enumeratePackagesIn(packRoot);
        }
        const collected = [];
        for (const mask of pushMask) {
            const maskFiles = await findFilesFor(mask);
            collected.push(...maskFiles);
        }
        return collected;
    }
    async function findFilesFor(mask) {
        if (await fileExists(mask)) {
            return [path.resolve(mask)];
        }
        const env = requireModule("env"), maskContainer = path.dirname(mask), searchContainers = path.isAbsolute(mask)
            ? [maskContainer]
            : [maskContainer, `${env.resolve(env.PACK_TARGET_FOLDER)}/${maskContainer}`], files = await lsAll(searchContainers);
        const maskHasFolders = mask.includes("/") || mask.includes("\\"), leaf = path.basename(mask), start = leaf.startsWith("*") ? ".*" : "^", end = leaf.endsWith("*") ? ".*" : "", regexed = mask.replace(/\*/g, ".*").replace(/\\/g, "\\/"), nupkgRe = /\.nupkg$/i, symbolsRe = /\.symbols\.nupkg$/i, maskRe = new RegExp(`${start}${regexed}${end}`);
        return files.filter((f) => {
            const toTest = maskHasFolders
                ? f
                : path.basename(f);
            return !symbolsRe.test(toTest) &&
                nupkgRe.test(toTest) &&
                maskRe.test(toTest);
        });
    }
    async function lsAll(dirs) {
        const result = [];
        for (const dir of dirs) {
            const files = await ls(dir, {
                entities: FsEntities.files,
                recurse: false,
                fullPaths: true
            });
            result.push(...files);
        }
        return result;
    }
    async function enumeratePackagesIn(packRoot) {
        return await ls(packRoot, {
            entities: FsEntities.files,
            match: /\.nupkg$/i,
            exclude: [/\.symbols\.nupkg$/i, /\.snupkg$/i],
            recurse: false,
            fullPaths: true
        });
    }
    module.exports = {
        resolveNugetPushPackageFiles
    };
})();
