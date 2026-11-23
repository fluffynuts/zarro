(function() {
    const
        { fileExists, readTextFileLines, writeTextFile } = require("yafs"),
        debug = require("debug")("zarro::main"),
        log = requireModule<Log>("log");

    const defaultDefaultsFile = ".zarro-defaults";

    interface LoadDefaultsOptions {
        // these are injectable for testing
        defaultsFile?: string;
        env?: Dictionary<string | undefined>;
    }

    async function createZarroDefaultsEmpty(defaultsFile: string) {
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

    async function loadDefaults(options?: LoadDefaultsOptions): Promise<void> {
        const
            defaultsFile = options?.defaultsFile ?? defaultDefaultsFile,
            env = options?.env ?? process.env,
            exists = await fileExists(defaultsFile);
        if (!exists) {
            await createZarroDefaultsEmpty(defaultsFile);
            return;
        }
        const
            lines: string[] = await readTextFileLines(defaultsFile);
        for (const line of lines) {
            const
                [ code ] = splitComment(line);
            if (isEmpty(code)) {
                // comment-only line or empty line
                continue;
            }
            if (looksInvalid(code)) {
                log.warn(`invalid config line in ${ defaultsFile }:\n${ line }`);
                continue;
            }
            const
                parts = code.trim().split("="),
                name = parts[0],
                value = parts.slice(1).join("="),
                forced = name[0] === "!",
                notYetSet = env[name] === undefined;
            if (notYetSet || forced) {
                const key = name.replace(/^!/, "");
                if (value) {
                    debug(`setting env var ${ key } to '${ value }'`);
                    env[key] = value;
                } else {
                    debug(`deleting env var ${ key }`);
                    delete env[key];
                }
            } else {
                debug(`env var ${ name } is already set, force it by setting !${ name }=${ value } in ${ defaultsFile }`);
            }
        }
    }

    function looksInvalid(code: string) {
        return (code || "").indexOf("=") === -1;
    }

    function isEmpty(text: string) {
        return (text || "").trim() === "";
    }

    function splitComment(line: string): [ string, string ] {
        if (!line) {
            return [ "", "" ];
        }
        const idx = line.indexOf("#");
        if (idx === -1) {
            return [ line, "" ];
        }
        return [ line.substring(0, idx), line.substring(idx + 1) ];
    }

    module.exports = loadDefaults;
})();
