"use strict";
(function () {
    const os = require("os"), requireModule = require("../../gulp-tasks/modules/require-module"), chalk = requireModule("ansi-colors"), quoteIfRequired = requireModule("quote-if-required"), which = require("which"), { splitPath } = requireModule("path-utils"), path = require("path"), isFile = require("../is-file"), isDir = require("../is-dir"), debug = require("debug")("zarro::invoke-gulp"), projectDir = path.dirname(path.dirname(__dirname)), ZarroError = requireModule("zarro-error"), spawn = requireModule("spawn");
    function alwaysAccept() {
        return true;
    }
    async function tryToFindGulpCliFromInstalledModule() {
        const nodeModulesDir = path.dirname(path.dirname(path.dirname(__dirname))), binDir = path.join(nodeModulesDir, ".bin");
        await validate(nodeModulesDir, binDir);
        return generateFullGulpCliPathFor(binDir);
    }
    async function validate(nodeModulesDir, nodeBinDir) {
        const nodeModulesDirName = path.basename(nodeModulesDir);
        if (nodeModulesDirName !== "node_modules") {
            throw new ZarroError(`Expected ${nodeModulesDir} to be a node_modules folder`);
        }
        if (!(await isDir(nodeBinDir))) {
            throw new ZarroError(`node_modules bin dir not found at ${nodeBinDir}`);
        }
    }
    async function generateFullGulpCliPathFor(nodeModulesBinDir) {
        const stub = os.platform() === "win32"
            ? "gulp.cmd"
            : "gulp";
        const fullStubPath = path.join(nodeModulesBinDir, stub);
        if (!(await isFile(fullStubPath))) {
            const message = `Can't find gulp cli at ${fullStubPath}\nDo you have gulp installed?`;
            console.error(chalk.red(message));
            console.error(chalk.yellow("(gulp should have been installed as a dependency of zarro; if it's missing, npm did something wrong)"));
            throw new ZarroError(message);
        }
        return fullStubPath;
    }
    async function tryToFindGulpFromOwnNodeModules() {
        // mostly needed for testing
        const nodeModulesDir = path.join(projectDir, "node_modules"), binDir = path.join(nodeModulesDir, ".bin");
        await validate(nodeModulesDir, binDir);
        return generateFullGulpCliPathFor(binDir);
    }
    async function findGulp() {
        try {
            return await which("gulp");
        }
        catch (e) {
            console.error(chalk.red(`Can't find gulp in the path
- when running zarro as an npm script, gulp should be in your path
  from your node_modules/.bin folder as gulp is a dependency of zarro.
  I'll try finding gulp manually, but things are probably going to end badly`));
            const isInstalledAsModule = !!splitPath(__dirname).find(d => d === "node_modules");
            return isInstalledAsModule
                // gulp really should be in the path...
                ? tryToFindGulpCliFromInstalledModule()
                : tryToFindGulpFromOwnNodeModules();
        }
    }
    async function invokeGulp(args, opts) {
        if (args && args.length === 1 && args[0] === "@") {
            args[0] = process.env.npm_lifecycle_event;
        }
        const gulp = await findGulp(), gulpTasksFolder = path.join(projectDir, "gulp-tasks"), gulpFile = path.join(gulpTasksFolder, "start", "gulpfile.js"), cwd = process.cwd(), envVars = Object.assign({}, process.env, {
            GULP_TASKS_FOLDER: gulpTasksFolder,
            RUNNING_AS_ZARRO: 1
        }), trueFlags = new Set(["true", "1", "T", "on"]), noColor = trueFlags.has(`${process.env.NO_COLOR}`), allArgs = [
            // this will be run via spawn, which now collects output for error
            // reporting, so we have to force color on again because gulp
            // realises that it's being piped
            noColor ? "--no-color" : "--color",
            "--gulpfile",
            quoteIfRequired(gulpFile),
            "--cwd",
            quoteIfRequired(cwd),
        ].concat(args);
        debug({
            label: "running gulp with",
            gulp,
            allArgs
        });
        return spawn(gulp, allArgs, Object.assign(Object.assign({ env: envVars, cwd, 
            // default to be interactive, so we can, eg, allow for user to input an OTP
            interactive: true }, opts), { stdio: "inherit" }));
    }
    module.exports = {
        test: alwaysAccept,
        handler: invokeGulp
    };
})();
