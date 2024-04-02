"use strict";
(function () {
    const { readTextFileSync } = require("yafs"), entryPoint = require.resolve("gulp"), path = require("path"), containingFolder = path.dirname(entryPoint), packageJson = path.join(containingFolder, "package.json"), gulpInfo = readJson(packageJson), parts = gulpInfo.version.split(".").map((s) => parseInt(s, 10));
    function readJson(pathToFile) {
        const contents = readTextFileSync(pathToFile);
        return JSON.parse(contents);
    }
    module.exports = {
        major: parts[0],
        minor: parts[1],
        patch: parts[2]
    };
})();
