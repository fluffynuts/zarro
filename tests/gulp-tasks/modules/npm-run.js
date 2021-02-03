"use strict";
(function () {
    const os = require("os"), spawn = requireModule("spawn");
    async function npmRun(args) {
        if (os.platform() === "win32") {
            await spawn("cmd", ["/c", "npm"].concat(args));
        }
        else {
            await spawn("npm", args);
        }
    }
    module.exports = {
        npmRun
    };
})();
