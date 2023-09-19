"use strict";
(function () {
    const gulp = requireModule("gulp"), env = requireModule("env");
    env.register({
        name: "ERROR_WHEN_DEBUGGER_STATEMENTS",
        help: "when set true, throw an error and abort when finding debugger statements in the code",
        default: "false"
    });
    gulp.task("verify-no-debugger", async () => {
        const runInParallel = requireModule("run-in-parallel"), log = requireModule("log"), { ls, readTextFile, FsEntities } = require("yafs");
        let foundDebugger = false;
        const problemFiles = [], gulpTaskFiles = await findSourceFilesUnder("gulp-tasks"), indexModules = await findSourceFilesUnder("index-modules"), allFiles = [
            "index.js",
        ].concat(gulpTaskFiles).concat(indexModules), actions = allFiles.map((f) => {
            return async () => {
                await verifyNoDebuggerIn(f);
            };
        });
        await runInParallel(2, ...actions);
        if (foundDebugger) {
            for (const file of problemFiles) {
                log.error(`debugger statement at: ${file}`);
            }
            throw new Error(`should not leave debugger statements in the code`);
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
                    problemFiles.push(`${f}:${s}`);
                }
            }
        }
    });
})();
