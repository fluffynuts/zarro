"use strict";
(function () {
    const { currentShortSHA } = requireModule("git-sha");
    const { timestamp } = requireModule("timestamp");
    module.exports = function generateVersionSuffix() {
        return `${timestamp({ fullYear: false })}.${currentShortSHA()}`;
    };
})();
