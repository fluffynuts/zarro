(function() {
    const
        requireModule = require("../../gulp-tasks/modules/require-module") as RequireModuleFn,
        log = requireModule<Log>("log"),
        {
            fileExists,
            writeTextFile,
            readTextFile
        } = require("yafs");

    async function trySetupZarroScript(
        overridePackageFileName: string
    ) {
        const
            pkg = overridePackageFileName || "package.json",
            exists = await fileExists(pkg);
        if (!exists) {
            return;
        }
        const
            stringContents = await readTextFile(pkg),
            tabSize = guessTabSizeFor(stringContents),
            packageJson = JSON.parse(stringContents);
        let scripts = packageJson.scripts;
        if (!scripts) {
            packageJson.scripts = scripts = {};
        }
        if (scripts["zarro"]) {
            log.info("zarro npm script already installed; use with 'npm run zarro'");
        }
        if (!scripts["zarro"]) {
            scripts["zarro"] = "zarro";
        }
        await writeTextFile(pkg, JSON.stringify(packageJson, null, tabSize));
        log.info("run zarro with 'npm run zarro -- {tasks or gulp arguments}')");
        log.info("eg: 'npm run zarro -- build' to attempt .net project build");
        log.info("get more help with 'npm run zarro -- --help'");
    }

    function guessTabSizeFor(json: string) {
        const lines = (json || "").split("\n");
        if (lines.length < 2) {
            return 2;
        }
        const leadingSpaces = lines[1].match(/^ +"/g);
        if (leadingSpaces) {
            const calculated = leadingSpaces.length - 1; // drop the quote
            return calculated > 0
                ? calculated
                : 2;
        }
        return 2; // give up
    }


    function isInit(args: string[]) {
        return args.length === 1 &&
            args[0] === "--init";
    }

    module.exports = {
        test: isInit,
        handler: trySetupZarroScript
    };
})();
