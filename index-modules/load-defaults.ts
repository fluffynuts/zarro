(function() {
    const
        { fileExists, readTextFileLines, writeTextFile } = require("yafs"),
        debug = require("debug")("zarro::main"),
        log = requireModule<Log>("log");

    const
        defaultDefaultsFile = ".zarro-defaults",
        defaultsSection = "defaults", // the section before any [header]
        // the whole (comment-stripped) line must be the header: otherwise a value like PATTERN=[abc] would be one
        sectionHeaderRe = /^\s*\[([\w\s.-]+)]\s*$/;

    interface LoadDefaultsOptions {
        // these are injectable for testing
        defaultsFile?: string;
        env?: Dictionary<string | undefined>;
        // the npm script being run, which selects [sections] in the defaults file
        taskName?: string;
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
#
# a variable can take its value from another environment variable:
#     VARIABLE=$OTHER_VARIABLE
#
# variables can be limited to one npm script with a [section] header, eg
#     [release]
#     VARIABLE=Value
#   applies only when running \`npm run release\`; use [defaults] to go
#   back to variables which apply to everything
`);
    }

    async function loadDefaults(options?: LoadDefaultsOptions): Promise<void> {
        const
            defaultsFile = options?.defaultsFile ?? defaultDefaultsFile,
            env = options?.env ?? process.env,
            taskName = (options && "taskName" in options
                ? options.taskName
                : process.env.npm_lifecycle_event) ?? "",
            exists = await fileExists(defaultsFile);
        if (!exists) {
            await createZarroDefaultsEmpty(defaultsFile);
            return;
        }
        const
            lines: string[] = await readTextFileLines(defaultsFile),
            currentTask = taskName.toLowerCase();
        let currentSection = defaultsSection;
        for (const line of lines) {
            const
                [ code ] = splitComment(line);
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
                log.warn(`invalid config line in ${ defaultsFile }:\n${ line }`);
                continue;
            }
            const
                parts = code.trim().split("="),
                name = parts[0],
                value = parts.slice(1).join("="),
                forced = name[0] === "!",
                forwarded = value[0] === "$",
                notYetSet = env[name] === undefined;
            if (notYetSet || forced) {
                const
                    key = name.replace(/^!/, ""),
                    finalValue = forwarded
                        ? env[value.substring(1)]
                        : value;
                if (finalValue) {
                    debug(`setting env var ${ key } to '${ finalValue }'`);
                    env[key] = finalValue;
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
