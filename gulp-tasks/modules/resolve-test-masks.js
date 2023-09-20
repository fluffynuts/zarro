"use strict";
(function () {
    const env = requireModule("env"), resolveMasks = requireModule("resolve-masks");
    module.exports = function resolveTestMasks(isDotnetCore) {
        if (isDotnetCore === undefined) {
            isDotnetCore = env.resolveFlag("DOTNET_CORE");
        }
        return resolveMasks([env.TEST_INCLUDE, env.TEST_ADDITIONAL_INCLUDE], [env.TEST_EXCLUDE, env.TEST_ADDITIONAL_EXCLUDE], p => {
            if (p.match(/\*\*$/)) {
                p += "/*";
            }
            return isDotnetCore
                ? `${p}.csproj`
                : `${p}.dll`;
        });
    };
})();
