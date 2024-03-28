(function () {
  const
    taskName = "release-nuget",
    gulp = requireModule<Gulp>("gulp"),
    env = requireModule<Env>("env");

  env.associate([
    env.PACK_TARGET_FOLDER,
    env.NUGET_SOURCE
  ], taskName);

  gulp.task(taskName, [ "clear-packages-folder", "pack" ], async () => {
      const
        log = requireModule<Log>("log"),
        ZarroError = requireModule<ZarroError>("zarro-error"),
        resolveNugetApiKey = requireModule<ResolveNugetApiKey>("resolve-nuget-api-key"),
        {
          FsEntities,
          ls
        } = require("yafs"),
        { nugetPush } = requireModule<DotNetCli>("dotnet-cli"),
        packageDir = env.resolve(env.PACK_TARGET_FOLDER),
        packageFiles = await ls(packageDir, {
          fullPaths: true,
          recurse: false,
          entities: FsEntities.files,
          match: /\.nupkg$/,
          exclude: /\.symbols\.nupkg$/
        });

      if (packageFiles.length === 0) {
        throw new ZarroError(`Unable to find any .nupkg files under '${ packageDir }'`);
      }

      let version = undefined;
      for (const pkg of packageFiles) {
        if (!version) {
          const matches = pkg.match(/(?<version>\d+\.\d+\.\d+(?<tag>[a-zA-Z0-9-]+)?)/)
          version = matches?.groups["version"];
        }
        const source = env.resolve(env.NUGET_SOURCE);
        if (env.resolveFlag(env.DRY_RUN)) {
          log.info(`DRY_RUN: would have pushed '${pkg}' to '${source}'`);
        } else {
          await nugetPush({
            source,
            target: pkg,
            apiKey: await resolveNugetApiKey(source)
          });
        }
      }

      if (!version) {
        log.warn(`Unable to determine version to tag at - set '${ env.GIT_TAG }' to manually override.`);
        return;
      }

      const gitTagAndPush = requireModule<GitTagAndPush>("git-tag-and-push");
      await gitTagAndPush(version);

    }
  );
})();
