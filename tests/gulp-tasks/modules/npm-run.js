"use strict";
(function () {
    const os = require("os"), spawn = requireModule("spawn");
    function flatten(a) {
        // essentially Array.flat, but I'm not assuming that's
        // available
        return a.reduce((acc, cur) => {
            if (Array.isArray(cur)) {
                return acc.concat(cur);
            }
            else {
                acc.push(cur);
                return acc;
            }
        }, []);
    }
    async function npmRun(...args) {
        const flattened = flatten(args);
        if (os.platform() === "win32") {
            await spawn("cmd", ["/c", "npm"].concat(flattened), {
                interactive: true
            });
        }
        else {
            await spawn("npm", flattened);
        }
    }
    async function foo() {
        await npmRun("foo", "bar");
        await npmRun(["foo", "bar"]);
    }
    module.exports = {
        npmRun
    };
})();
