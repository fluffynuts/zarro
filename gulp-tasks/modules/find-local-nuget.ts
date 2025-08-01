(function () {
  const
    path = require("path"),
    log = requireModule<Log>("log"),
    { fileExists } = require("yafs"),
    resolveNuget = requireModule<ResolveNuget>("resolve-nuget"),
    shimNuget = requireModule<ShimNuget>("shim-nuget"),
    pathUnquote = requireModule<PathUnquote>("path-unquote"),
    downloadNuget = requireModule<DownloadNuget>("download-nuget"),
    env = requireModule<Env>("env");

  let
    startedDownload = false,
    resolver = (_: string) => {
    },
    lastResolution = new Promise<string>(function (resolve) {
      resolver = resolve;
    });

  async function findLocalNuget(quiet?: boolean): Promise<string> {
    const
      beQuiet = !!quiet,
      targetFolder = env.resolve("BUILD_TOOLS_FOLDER"),
      localNuget = resolveNuget(undefined, false) || path.join(targetFolder, "nuget.exe");
    if (startedDownload) {
      return lastResolution;
    }
    if (await fileExists(pathUnquote(localNuget))) {
      return shimNuget(localNuget);
    }
    startedDownload = true;
    try {
      const result = await downloadNuget(targetFolder, beQuiet);
      resolver(result); // catch up any other code waiting on this
      return result;
    } catch (err) {
      if (await fileExists(localNuget)) {
        log.info(err);
        log.info("Falling back on last local nuget.exe");
        resolver(localNuget);
        return localNuget;
      }
      throw err;
    }
  }

  module.exports = findLocalNuget;
})();
