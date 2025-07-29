"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    const through = require("through2");
    const PluginError = require("plugin-error");
    const { system } = require("system-wrapper");
    function streamify(fn, optionsFactory, pluginName, operation) {
        return through.obj(async function (file, enc, cb) {
            try {
                const options = await optionsFactory(file);
                await fn(options);
                cb(null, file);
            }
            catch (e) {
                const pluginError = system.isError(e)
                    ? new PluginError(pluginName, `${operation} failed:\n${e.toString()}`)
                    : new PluginError(pluginName, `${operation} failed: ${e.message || e}`);
                this.emit("error", pluginError);
                cb(pluginError, file);
            }
        });
    }
    module.exports = {
        streamify
    };
})();
