"use strict";
(function () {
    const { fileExistsSync } = require("yafs");
    module.exports = function isFile(path) {
        return fileExistsSync(path);
    };
})();
