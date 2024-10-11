"use strict";
(function () {
    function timestamp(opts) {
        var _a;
        opts = opts || {};
        if (!opts.delimiter) {
            opts.delimiter = "";
        }
        if (opts.includeSeconds === undefined) {
            opts.includeSeconds = true;
        }
        if (opts.includeMilliseconds === undefined) {
            opts.includeMilliseconds = false;
        }
        if (opts.fullYear === undefined) {
            opts.fullYear = true;
        }
        const now = (_a = opts.forDate) !== null && _a !== void 0 ? _a : new Date();
        let yearString = `${now.getFullYear()}`;
        if (!opts.fullYear) {
            yearString = yearString.substring(2, 4);
        }
        const parts = [
            yearString,
            `${now.getMonth() + 1}`.padStart(2, "0"),
            `${now.getDate()}`.padStart(2, "0"),
            `${now.getHours()}`.padStart(2, "0"),
            `${now.getMinutes()}`.padStart(2, "0")
        ];
        if (opts.includeSeconds) {
            parts.push(`${now.getSeconds()}`.padStart(2, "0"));
        }
        if (opts.includeMilliseconds) {
            parts.push(`${now.getMilliseconds()}`.padStart(3, "0"));
        }
        return parts.join(opts.delimiter);
    }
    module.exports = {
        timestamp
    };
})();
