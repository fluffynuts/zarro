"use strict";
(function () {
    const ZarroError = requireModule("zarro-error");
    const { parseBool } = requireModule("parse-bool");
    function env(name, fallback) {
        const value = process.env[name];
        if (value !== undefined) {
            return value;
        }
        const argCount = Array.from(arguments).length;
        if (argCount > 1) {
            return fallback;
        }
        throw new ZarroError(`environment variable '${name}' is not defined and no fallback provided`);
    }
    function envNumber(name, fallback) {
        const haveFallback = fallback !== undefined, value = haveFallback ? env(name, fallback === null || fallback === void 0 ? void 0 : fallback.toString()) : env(name), parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
            return parsed;
        }
        throw new ZarroError(`environment variable '${name}' is invalid: expected numeric value but found '${value}'`);
    }
    function envFlag(name, fallback) {
        const haveFallback = fallback !== undefined, value = haveFallback ? env(name, fallback === null || fallback === void 0 ? void 0 : fallback.toString()) : env(name);
        return parseBoolEnvVar(name, value);
    }
    function parseBoolEnvVar(name, value) {
        try {
            return parseBool(value, true);
        }
        catch (e) {
            throw new ZarroError(`environment variable '${name}' is invalid: could not parse '${value}' as a boolean value`);
        }
    }
    module.exports = {
        env,
        envNumber,
        envFlag
    };
})();
