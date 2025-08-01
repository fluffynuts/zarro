"use strict";
(function () {
    // originally, I wanted to use the opn package, now renamed to
    // open, but the author has kindly made it impossible to require
    // from within zarro (I get an error about it being an ESM module);
    // since my requirements are simple, I'll just roll my own.
    const os = require("os"), ZarroError = requireModule("zarro-error"), { system } = require("system-wrapper");
    async function open(url) {
        const opener = findOpenerForPlatform();
        await system(opener, [url]);
    }
    function findOpenerForPlatform() {
        switch (os.platform()) {
            case "darwin":
                return "open";
            case "netbsd":
            case "freebsd":
            case "linux":
            case "openbsd":
                return "xdg-open";
            case "win32":
                return "start";
            case "cygwin":
                // if we believe: https://stackoverflow.com/a/577698/1697008
                return "cygstart";
            case "aix":
            case "android":
            case "sunos":
            default:
                throw platformNotSupported();
        }
    }
    function platformNotSupported() {
        return new ZarroError(`Platform not supported for opening urls. Please open an issue at https://github.com/fluffynuts/zarro.`);
    }
    module.exports = {
        open
    };
})();
