"use strict";
(function () {
    const system = requireModule("system"), debug = requireModule("debug")(__filename), findLocalNuget = requireModule("find-local-nuget");
    module.exports = async function (args, opts) {
        const nuget = await findLocalNuget();
        debug(`spawn nuget: ${nuget} ${args.join(" ")}`);
        if (opts && Object.keys(opts).length) {
            debug(` nuget spawn options: ${JSON.stringify(opts)}`);
        }
        return await system(nuget, args, opts);
    };
})();
