"use strict";
(function () {
    if (!process.env.ZARRO_NO_WARN_DEPRECATED) {
        console.warn("zarro module 'dotnet-cli' has been deprecated and simply forwards functions from the 'dotnet-cli' npm package");
    }
    const { system } = require("system-wrapper");
    const realDotnetCli = require("dotnet-cli");
    const dotnetCli = Object.assign({}, realDotnetCli);
    const decoratedClearCaches = dotnetCli.clearCaches;
    decoratedClearCaches.httpCache = dotnetCli.DotNetCache.httpCache;
    decoratedClearCaches.temp = dotnetCli.DotNetCache.temp;
    decoratedClearCaches.all = dotnetCli.DotNetCache.all;
    decoratedClearCaches.globalPackages = dotnetCli.DotNetCache.globalPackages;
    const functions = Object.keys(dotnetCli).filter(k => typeof dotnetCli[k] === "function");
    for (const fn of functions) {
        const original = dotnetCli[fn];
        dotnetCli[fn] = async (...args) => {
            try {
                return await original(...args);
            }
            catch (e) {
                if (system.isError(e)) {
                    return e;
                }
                throw e;
            }
        };
    }
    module.exports = Object.assign({}, dotnetCli);
})();
