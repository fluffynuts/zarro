"use strict";
(function () {
    const requireModule = require("../../gulp-tasks/modules/require-module");
    function test(args) {
        return new Set(args || []).has("--create-task");
    }
    async function createTask() {
        const log = requireModule("log"), kebabCase = require("lodash.kebabcase"), path = require("path"), { fileExists } = require("yafs"), { ask } = requireModule("ask"), taskName = await ask(`Please provide a task name.
It will be kebab-cased for you, so you can type a short sentence if you like.
For example, if you type "Do the things", your task will be called "do-the-things"
Task name: `, {
            validator: (s) => !!s
        }), safeName = kebabCase(taskName.replace(/"/g, "")), yesValues = ["Y", "yes", "Yes", "y", "",], yes = new Set(yesValues), noValues = ["N", "no", "No", "n"], no = new Set(noValues), yesNo = new Set(yesValues.concat(noValues)), yesNoValidator = (s) => {
            s = `${s}`.trim();
            return yesNo.has(s);
        }, includeHelpRaw = await ask("Include helpful commentary? (Y/n)", {
            validator: yesNoValidator
        }), includeHelp = yes.has(includeHelpRaw), surfaceTaskRaw = await ask(`Surface this task in package.json so you can 'npm run ${safeName}? (Y/n): `), surfaceTask = yes.has(surfaceTaskRaw), tsFile = `${safeName}.ts`;
        const targetPath = path.join("local-tasks", tsFile);
        if (await fileExists(targetPath)) {
            log.error(`local task file already exists: ${targetPath}`);
            process.exit(1);
        }
        else {
            await generateSkeletonTaskFileAt(targetPath, safeName, includeHelp);
            await ensureGeneratedTaskFilesAreIgnored();
            log.info(`task file created at ${targetPath}`);
            if (surfaceTask) {
                await surfaceTaskAsNpmScript(safeName);
            }
        }
    }
    async function ensureGeneratedTaskFilesAreIgnored() {
        const ignoreFile = ".gitignore", configLine = "local-tasks/*.generated.js", { fileExists, readTextFile, writeTextFile } = require("yafs");
        if (!await fileExists(ignoreFile)) {
            return;
        }
        const contents = await readTextFile(ignoreFile), lines = contents.split("\n").map((l) => l.trim());
        if (lines.includes(configLine)) {
            return;
        }
        lines.push(configLine);
        await writeTextFile(ignoreFile, lines.join("\n"));
    }
    async function surfaceTaskAsNpmScript(task) {
        const { readTextFile, writeTextFile } = require("yafs"), filename = "package.json", log = requireModule("log"), guessIndent = requireModule("guess-indent"), raw = await readTextFile(filename), indent = guessIndent(raw), packageIndex = JSON.parse(raw);
        if (!packageIndex.scripts) {
            packageIndex.scripts = {};
        }
        if (packageIndex.scripts[task]) {
            log.error(`Not adding npm script '${task}': already exists.`);
            return;
        }
        packageIndex.scripts[task] = "zarro @";
        const newJson = JSON.stringify(packageIndex, null, indent);
        await writeTextFile(filename, newJson);
    }
    function createTaskHelp(safeName) {
        return `
/*
*   requireModule<T>() is available within any zarro task file
*   so you can easily get ahold of modules used within zarro.
*
*   apart from the obvious use-cases (eg you want to write your
*   own specialized pipeline, but still use the wrapper functions
*   for dotnet (requireModule<DotNetCli("dotnet-cli")), there are
*   many utilities within zarro which can make task development
*   easier. Check out:
*   - System ("system")
*     - powerful system command runner, providing optional callbacks
*       for IO handling, or simply returning the IO and exit code
*   - Exec ("exec")
*     - simple executor wrapping system, returns stdout as a string
*   - PromisifyStream ("promisify-stream" or "promisify")
*     - converts a stream (eg gulp.src(...)...) to an awaitable
*       promise
*   - AnsiColors ("ansi-colors")
*     - typed provider for "ansi-colors" module to colorise output
*
*   in addition, there are other modules installed as runtime
*   dependencies for zarro which are found on npm and may be useful:
*   - yafs
*   - debug
*   - npm-run-all, providing:
*       - run-s: runs npm scripts in series
*       - run-p: runs npm scripts in parallel
*   - simple-git
*   - and stream/gulp things like through2
*
*   if you're new to zarro, you may want to check out example
*   usage in these projects:
*   https://github.com/fluffynuts/
*       - diff-buddy (example of "batteries-included" near-zero-conf)
*       - NExpect
*       - PeanutButter
*       - newts
*/

/*
* OPTIONAL:
*   Register environment variables that relate to your task
*     via env.associate(...) so that 'zarro --show-env' will include
*     information about the association, so consumers can tell
*     which environment variables affect which tasks
*/

env.associate([
    env.DRY_RUN
], [
    "${safeName}"
]);
`;
    }
    const closureHelp = `
// TypeScript local tasks must be wrapped in a closure to prevent multiple
//   requireModule<T>(...) calls from clashing with each other in TS-land.
//   This is not a requirement if you're creating a JavaScript task, but then
//   you'd lose out on all the TS goodies :D
// TypeScript tasks will be transpiled for you when zarro runs, with a
//   .generated.js extension. You do not need to transpile anything yourself.
`.trim();
    async function generateSkeletonTaskFileAt(target, safeName, includeHelp) {
        const path = require("path"), { mkdir, writeTextFile } = require("yafs"), whyClosure = includeHelp ? closureHelp : "", help = includeHelp ? createTaskHelp(safeName) : "", example = includeHelp ? createExampleModuleUsage(safeName) : "", container = path.dirname(target);
        await mkdir(container);
        await writeTextFile(target, `
/// <reference path="../node_modules/zarro/types.d.ts" />
(function() {
${whyClosure}
    const
      gulp = requireModule<Gulp>("gulp"),
      env = requireModule<Env>("env");
    ${help}
    gulp.task("${safeName}", async () => {
        ${example}
        console.log("running skeleton task: ${safeName}: ");
        return Promise.resolve();
    });
})();`.trim());
    }
    function createExampleModuleUsage(safeName) {
        return `// you can surface this task to be run as 'npm run ${safeName}'
    // by adding this to your scripts section in package.json
    // "${safeName}": "zarro @",

    // to make invocations faster, it's recommended
    // to require as much as possible locally (ie inside the task
    // or called functions) as this will mean that these modules
    // would only have to be fully resolved when actually necessary
    const
        system = requireModule<System>("system"),
        systemResult = await system("whoami", [], { suppressOutput: true });
    console.log(\`'whoami' from system() reports the current user is: $\{systemResult.stdout[0]}\`);

    // exec is a convenience wrapper around system, for light / quick calls
    const
        exec = requireModule<Exec>("exec"),
        execResult = await exec("whoami");
    console.log(\`'whoami' from exec() reports the current user is: $\{execResult}\`);
    console.log({
        label: "is this a dry run?",
        result: env.resolveFlag(env.DRY_RUN)
    });
    `.trim();
    }
    module.exports = {
        test: test,
        handler: createTask
    };
})();
