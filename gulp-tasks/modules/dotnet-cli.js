"use strict";
(function () {
    if (!process.env.ZARRO_NO_WARN_DEPRECATED) {
        console.warn("zarro module 'dotnet-cli' has been deprecated and simply forwards functions from the 'dotnet-cli' npm package");
    }
    const dotnetCli = require("dotnet-cli");
    const decoratedClearCaches = dotnetCli.clearCaches;
    decoratedClearCaches.httpCache = dotnetCli.DotNetCache.httpCache;
    decoratedClearCaches.temp = dotnetCli.DotNetCache.temp;
    decoratedClearCaches.all = dotnetCli.DotNetCache.all;
    decoratedClearCaches.globalPackages = dotnetCli.DotNetCache.globalPackages;
    module.exports = Object.assign({}, dotnetCli);
})();
