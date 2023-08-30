"use strict";
(function () {
    const { folderExistsSync } = require("yafs");
    module.exports = async function isDir(path) {
        return folderExistsSync(path);
    };
})();
