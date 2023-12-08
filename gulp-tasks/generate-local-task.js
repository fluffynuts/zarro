"use strict";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("generate-local-task", async () => {
        const log = requireModule("log"), path = require("path"), { ask } = requireModule("ask"), rawName = await ask("name of new task"), { writeTextFile, fileExists } = require("yafs"), taskName = rawName.trim().replace(/\s+/g, "-"), target = path.join("local-tasks", `${taskName}.ts`);
        if (await fileExists(target)) {
            throw new Error(`File already exists at '${target}' - remove it first or rename your task`);
        }
        await writeTextFile(target, template.replace("%TASK_NAME%", taskName));
        log.info(`generated new task file at: ${target}`);
    });
    const template = `
/// <reference path="../node_modules/zarro/types.d.ts" />
const
  gulp = requireModule<Gulp>("gulp");
  
gulp.task(\`%TASK_NAME%\`, async () => {
  
});  
`.trim();
})();
