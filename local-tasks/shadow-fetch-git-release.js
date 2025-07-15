"use strict";
const gulp = requireModule("gulp");
gulp.task("shadow-fetch-github-release-dist", async () => {
    const path = require("path"), { ExecStepContext } = require("exec-step"), ctx = new ExecStepContext(), baseDir = path.join("gulp-tasks", "modules", "fetch-github-release"), distDir = path.join(baseDir, "dist"), target = path.join(baseDir, "dist-copy"), { splitPath } = requireModule("path-utils"), { ls, copyFile, mkdir, FsEntities, CopyFileOptions } = require("yafs"), sourceFiles = await ls(distDir, {
        entities: FsEntities.files,
        fullPaths: true
    });
    await mkdir(target);
    for (const f of sourceFiles) {
        const parts = splitPath(f);
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === "") {
                parts[i] = "/";
                continue;
            }
            if (parts[i] === "dist") {
                parts[i] = "dist-copy";
                break; // only mod the first occurrence, for speed & safety
            }
        }
        const targetFile = path.join(...parts);
        await ctx.exec(`${f} -> ${targetFile}`, () => copyFile(f, targetFile, CopyFileOptions.overwriteExisting));
    }
});
