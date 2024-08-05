"use strict";
(function () {
    const taskName = "release-nuget", gulp = requireModule("gulp"), env = requireModule("env");
    env.associate([
        env.PACK_TARGET_FOLDER,
        env.NUGET_SOURCE
    ], taskName);
    gulp.task(taskName, ["clear-packages-folder", "pack"], async () => {
        const log = requireModule("log"), Git = require("simple-git"), git = new Git("."), ZarroError = requireModule("zarro-error"), resolveNugetApiKey = requireModule("resolve-nuget-api-key"), { FsEntities, ls } = require("yafs"), { nugetPush } = requireModule("dotnet-cli"), packageDir = env.resolve(env.PACK_TARGET_FOLDER), packageFiles = await ls(packageDir, {
            fullPaths: true,
            recurse: false,
            entities: FsEntities.files,
            match: /\.nupkg$/,
            exclude: /\.symbols\.nupkg$/
        });
        if (packageFiles.length === 0) {
            throw new ZarroError(`Unable to find any .nupkg files under '${packageDir}'`);
        }
        let version = undefined;
        for (const pkg of packageFiles) {
            if (!version) {
                const matches = pkg.match(/(?<version>\d+\.\d+\.\d+(?<tag>[a-zA-Z0-9-]+)?)/);
                version = matches === null || matches === void 0 ? void 0 : matches.groups["version"];
            }
            const source = env.resolve(env.NUGET_PUSH_SOURCE, env.NUGET_SOURCE) || "nuget.org";
            if (env.resolveFlag(env.DRY_RUN)) {
                log.info(`DRY_RUN: would have pushed '${pkg}' to '${source}'`);
            }
            else {
                await nugetPush({
                    source,
                    target: pkg,
                    apiKey: await resolveNugetApiKey(source)
                });
            }
        }
        if (!version) {
            log.warn(`Unable to determine version to tag at - set '${env.GIT_TAG}' to manually override.`);
            return;
        }
        await git.add(":/");
        await git.commit(`:bookmark: bump package version to ${version}`);
        const gitTagAndPush = requireModule("git-tag-and-push");
        await gitTagAndPush(version);
    });
})();
