"use strict";
(function () {
    const taskName = "clear-packages-folder", gulp = requireModule("gulp"), env = requireModule("env");
    env.associate([
        env.PACK_TARGET_FOLDER
    ], taskName);
    gulp.task("clear-packages-folder", async () => {
        const { rm, mkdir } = require("yafs"), packagesDir = env.resolve(env.PACK_TARGET_FOLDER);
        await rm(packagesDir);
        await mkdir(packagesDir);
    });
})();
