"use strict";
(async function () {
    requireModule("fetch");
    const path = require("path"), { folderExistsSync } = require("yafs"), 
    // ideally, during dev, we want fresh src files
    // but the build produces a dist folder with
    // js artifacts, which also work - but npm
    // refuses to pack them, and I haven't figured out
    // why; so another process should create dist-copy
    // specifically for packing purposes
    search = ["src", "dist", "dist-copy"];
    for (const item of search) {
        const seek = path.join(__dirname, "fetch-github-release", item);
        if (folderExistsSync(seek)) {
            module.exports = require(seek);
            return;
        }
    }
})();
