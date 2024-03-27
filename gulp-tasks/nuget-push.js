"use strict";
(function () {
    gulp.task("nuget-push", "Pushes the latest versions of packages in the package build dir", async () => {
        const debug = requireModule("debug")(__filename), path = require("path"), nugetPush = requireModule("nuget-push"), { ls, FsEntities } = require("yafs"), env = requireModule("env"), folder = env.resolve(env.PACK_TARGET_FOLDER), versionRe = /^(?<id>[A-Za-z\.]+)\.(?<version>\d\.\d\.\d)(-(?<tag>.*))?.nupkg$/, packages = await ls(folder, {
            recurse: false,
            entities: FsEntities.files,
            match: versionRe
        }), sorted = packages.sort().reverse(), seen = new Set();
        for (const file of sorted) {
            const match = file.match(versionRe), id = match === null || match === void 0 ? void 0 : match.groups["id"];
            if (seen.has(id)) {
                debug(`already seen ${id}, skipping ${file}`);
                continue;
            }
            seen.add(id);
            await nugetPush(path.join(folder, file));
        }
    });
})();
