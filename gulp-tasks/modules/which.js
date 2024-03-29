"use strict";
(function () {
    const _which_ = require("which");
    const cache = {};
    module.exports = function which(executable) {
        if (cache[executable]) {
            return cache[executable];
        }
        try {
            return cache[executable] = _which_.sync(executable);
        }
        catch (e) {
            return undefined;
        }
    };
})();
