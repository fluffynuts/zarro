"use strict";
(function () {
    const { fileExists, readTextFileLines, writeTextFile } = require("yafs"), debug = require("debug")("zarro::main"), log = requireModule("log");
    const defaultDefaultsFile = ".zarro-defaults", defaultsSection = "defaults", // the section before any [header]
    // the whole (comment-stripped) line must be the header: otherwise a value like PATTERN=[abc] would be one
    sectionHeaderRe = /^\s*\[([\w\s.-]+)]\s*$/;
    async function createZarroDefaultsEmpty(defaultsFile) {
        await writeTextFile(defaultsFile, `# zarro defaults file:
# place one VARIABLE=VALUE per line below
# values are used exactly as written, so don't put quotes around them
#
# precedence:
#   - variables here will not override existing environment variables
#     unless prepended with a bang, ie
#       !VARIABLE=Value
#     so anything you set in your package.json, eg with cross-env,
#     will override what's in here unless you've specifically marked
#     the setting in here as forced with !
#   - within this file, later lines override earlier ones (no ! needed)
#
# a variable can take its value from another environment variable:
#     VARIABLE=$OTHER_VARIABLE
#
# variables can be limited to one npm script with a [section] header, eg
#     VARIABLE=value for everything
#     [release]
#     VARIABLE=value just for \`npm run release\`
#   a section applies until the next header; use [defaults] to go
#   back to variables which apply to everything
`);
    }
    async function loadDefaults(options) {
        var _a, _b, _c;
        const defaultsFile = (_a = options === null || options === void 0 ? void 0 : options.defaultsFile) !== null && _a !== void 0 ? _a : defaultDefaultsFile, env = (_b = options === null || options === void 0 ? void 0 : options.env) !== null && _b !== void 0 ? _b : process.env, taskName = (_c = (options && "taskName" in options
            ? options.taskName
            : process.env.npm_lifecycle_event)) !== null && _c !== void 0 ? _c : "", exists = await fileExists(defaultsFile);
        if (!exists) {
            await createZarroDefaultsEmpty(defaultsFile);
            return;
        }
        const lines = await readTextFileLines(defaultsFile), currentTask = taskName.toLowerCase();
        let currentSection = defaultsSection;
        // variables this file has set: later lines may override them, whereas
        // variables which were already in the environment need a ! to be overridden
        const setByThisFile = new Set();
        for (const line of lines) {
            const [code] = splitComment(line);
            if (isEmpty(code)) {
                // comment-only line or empty line
                continue;
            }
            const sectionMatch = code.match(sectionHeaderRe);
            if (sectionMatch) {
                currentSection = sectionMatch[1].toLowerCase();
                continue;
            }
            if (currentSection !== defaultsSection && currentSection !== currentTask) {
                continue;
            }
            if (looksInvalid(code)) {
                log.warn(`invalid config line in ${defaultsFile}:\n${line}`);
                continue;
            }
            const parts = code.trim().split("="), name = parts[0], value = parts.slice(1).join("="), forced = name[0] === "!", forwarded = value[0] === "$", key = name.replace(/^!/, ""), canSet = env[key] === undefined || setByThisFile.has(key);
            if (canSet || forced) {
                const finalValue = forwarded
                    ? env[value.substring(1)]
                    : value;
                if (finalValue) {
                    debug(`setting env var ${key} to '${finalValue}'`);
                    env[key] = finalValue;
                    setByThisFile.add(key);
                }
                else {
                    debug(`deleting env var ${key}`);
                    delete env[key];
                    setByThisFile.delete(key);
                }
            }
            else {
                debug(`env var ${name} is already set, force it by setting !${name}=${value} in ${defaultsFile}`);
            }
        }
    }
    function looksInvalid(code) {
        return (code || "").indexOf("=") === -1;
    }
    function isEmpty(text) {
        return (text || "").trim() === "";
    }
    function splitComment(line) {
        if (!line) {
            return ["", ""];
        }
        const idx = line.indexOf("#");
        if (idx === -1) {
            return [line, ""];
        }
        return [line.substring(0, idx), line.substring(idx + 1)];
    }
    module.exports = loadDefaults;
})();
