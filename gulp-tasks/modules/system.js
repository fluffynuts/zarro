"use strict";
(function () {
    if (!process.env.ZARRO_NO_WARN_DEPRECATED) {
        console.warn("zarro module 'system' has been deprecated and simply forwards the exports from the 'system-wrapper' npm module");
    }
    module.exports = require("system-wrapper").system;
})();
