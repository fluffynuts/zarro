"use strict";
(function () {
    const { currentShortSHA } = requireModule("git-sha");
    const { timestamp } = requireModule("timestamp");
    const options = {
        fullYear: false,
        includeSeconds: false
    };
    module.exports = function generateVersionSuffix() {
        return `${timestamp(options)}.${currentShortSHA()}`;
    };
})();
