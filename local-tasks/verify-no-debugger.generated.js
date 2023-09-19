(function () {
    const gulp = requireModule("gulp");
    gulp.task("verify-no-debugger", async () => {
        const runInParallel = requireModule("run-in-parallel"), log = requireModule("log"), { ls, readTextFile, FsEntities } = require("yafs");
        let foundDebugger = false;
        const gulpTaskFiles = await findSourceFilesUnder("gulp-tasks"), indexModules = await findSourceFilesUnder("index-modules"), allFiles = [
            "index.js",
        ].concat(gulpTaskFiles).concat(indexModules), actions = allFiles.map((f) => {
            return async () => {
                await verifyNoDebuggerIn(f);
            };
        });
        await runInParallel(2, ...actions);
        if (foundDebugger) {
            throw new Error(`one ore more files contain debugger statements`);
        }
        async function findSourceFilesUnder(dir) {
            return await ls(dir, {
                recurse: true,
                entities: FsEntities.files,
                match: [
                    /\.ts$/,
                    /\.js$/
                ],
                fullPaths: true
            });
        }
        async function verifyNoDebuggerIn(f) {
            const debuggerLines = [], contents = await readTextFile(f), lines = contents.split("\n")
                .map((s) => s.trim()), _ = lines.filter((line, lineNumber) => {
                if (line.includes("debugger")) {
                }
                if (line === "debugger" || line === "debugger;") {
                    debuggerLines.push(lineNumber);
                }
            });
            foundDebugger = foundDebugger || (debuggerLines.length > 0);
            if (foundDebugger) {
                for (const s of debuggerLines) {
                    log.error(`debugger statement at ${f}:${s}`);
                }
            }
        }
    });
})();
