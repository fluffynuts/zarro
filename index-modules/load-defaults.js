"use strict";
(function () {
    const { fileExists, readTextFileLines, writeTextFile } = require("yafs"), debug = require("debug")("zarro::main"), log = requireModule("log");
    const defaultDefaultsFile = ".zarro-defaults";
    async function createZarroDefaultsEmpty(defaultsFile) {
        await writeTextFile(defaultsFile, `# zarro defaults file:
# place one VARIABLE=VALUE per line below
# variables here will not override existing environment variables
#   unless prepended with a bang, ie
#     !VARIABLE=Value
#   so this means anything you set in your package.json, eg with
#   cross-env, will override what's in here unless you've specifically
#   marked the setting in here as forced with !
`);
    }
    async function loadDefaults(options) {
        var _a, _b;
        const defaultsFile = (_a = options === null || options === void 0 ? void 0 : options.defaultsFile) !== null && _a !== void 0 ? _a : defaultDefaultsFile, env = (_b = options === null || options === void 0 ? void 0 : options.env) !== null && _b !== void 0 ? _b : process.env, exists = await fileExists(defaultsFile);
        if (!exists) {
            await createZarroDefaultsEmpty(defaultsFile);
            return;
        }
        const lines = await readTextFileLines(defaultsFile);
        for (const line of lines) {
            const [code] = splitComment(line);
            if (isEmpty(code)) {
                // comment-only line or empty line
                continue;
            }
            if (looksInvalid(code)) {
                log.warn(`invalid config line in ${defaultsFile}:\n${line}`);
                continue;
            }
            const parts = code.trim().split("="), name = parts[0], value = parts.slice(1).join("="), forced = name[0] === "!", notYetSet = env[name] === undefined;
            if (notYetSet || forced) {
                const key = name.replace(/^!/, "");
                if (value) {
                    debug(`setting env var ${key} to '${value}'`);
                    env[key] = value;
                }
                else {
                    debug(`deleting env var ${key}`);
                    delete env[key];
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
