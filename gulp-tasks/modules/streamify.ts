import { Transform } from "stream";
import * as vinyl from "vinyl";

(function() {
  const through = require("through2");
  const PluginError = require("plugin-error");
  const { system } = require("system-wrapper");

  function streamify<T>(
    fn: AsyncTVoid<T>,
    optionsFactory: OptionsFactory<T>,
    pluginName: string,
    operation: string
  ): Transform {
    return through.obj(async function(
      this: Transform,
      file: vinyl.BufferFile,
      enc: string,
      cb: (err: PluginError | null, file: vinyl.BufferFile) => void
    ) {
      try {
        const options = await optionsFactory(file);
        await fn(options);
        cb(null, file);
      } catch (e: any) {
        const pluginError = system.isError(e)
          ? new PluginError(pluginName, `${ operation } failed:\n${ e.toString() }`)
          : new PluginError(pluginName, `${ operation } failed: ${ (e as Error).message || e }`);
        this.emit("error", pluginError);
        cb(pluginError, file);
      }
    })
  }

  module.exports = {
    streamify
  };
})();
