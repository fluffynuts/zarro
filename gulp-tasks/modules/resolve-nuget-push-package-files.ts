(function () {
  const
    {
      ls,
      FsEntities,
      fileExists
    } = require("yafs"),
    path = require("path");

  async function resolveNugetPushPackageFiles(): Promise<string[]> {
    const
      env = requireModule<Env>("env"),
      packRoot = env.resolve(env.PACK_TARGET_FOLDER),
      pushMask = env.resolveArray(env.NUGET_PUSH_PACKAGES);

    if (pushMask.length === 0) {
      return await enumeratePackagesIn(packRoot);
    }

    const
      collected = [] as string[];

    for (const mask of pushMask) {
      const maskFiles = await findFilesFor(mask);
      collected.push(...maskFiles);
    }

    return collected;
  }

  async function findFilesFor(
    mask: string
  ): Promise<string[]> {
    if (await fileExists(mask)) {
      return [ path.resolve(mask) ];
    }
    const
      env = requireModule<Env>("env"),
      maskContainer = path.dirname(mask),
      searchContainers = path.isAbsolute(mask)
        ? [ maskContainer ]
        : [ maskContainer, `${ env.resolve(env.PACK_TARGET_FOLDER) }/${ maskContainer }` ],
      files = await lsAll(searchContainers);
    const
      maskHasFolders = mask.includes("/") || mask.includes("\\"),
      leaf = path.basename(mask),
      start = leaf.startsWith("*") ? ".*" : "^",
      end = leaf.endsWith("*") ? ".*" : "",
      regexed = mask.replace(/\*/g, ".*").replace(/\\/g, "\\/"),
      nupkgRe = /\.nupkg$/i,
      maskRe = new RegExp(`${ start }${ regexed }${ end }`);
    return files.filter(
      (f: string) => {
        const toTest = maskHasFolders
          ? f
          : path.basename(f);
        return nupkgRe.test(toTest) && maskRe.test(toTest)
      }
    );
  }

  async function lsAll(
    dirs: string[]
  ): Promise<string[]> {
    const result = [];
    for (const dir of dirs) {
      const files = await ls(
        dir, {
          entities: FsEntities.files,
          recurse: false,
          fullPaths: true
        }
      );
      result.push(...files);
    }
    return result;
  }

  async function enumeratePackagesIn(
    packRoot: string
  ): Promise<string[]> {
    return await ls(packRoot, {
      entities: FsEntities.files,
      match: /\.nupkg$/,
      recurse: false,
      fullPaths: true
    });
  }

  module.exports = {
    resolveNugetPushPackageFiles
  };
})();
