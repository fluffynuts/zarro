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
        { ctx } = require("exec-step"),
        log = requireModule<Log>("log"),
        Git = require("simple-git"),
        git = new Git("."),
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
        const source = env.resolve(env.NUGET_PUSH_SOURCE, env.NUGET_SOURCE) || "nuget.org";
        if (env.resolveFlag(env.DRY_RUN)) {
          log.info(`DRY_RUN: would have pushed '${ pkg }' to '${ source }'`);
        } else {
          await ctx.exec(
            `Pushing ${ pkg } to ${ source }`,
            async () =>
              await nugetPush({
                source,
                target: pkg,
                apiKey: await resolveNugetApiKey(source)
              })
          );
        }
      }

      if (!env.resolveFlag(env.RELEASE_TAG_AND_PUSH)) {
        log.info(`Skipping commit/tag/push: version increment will not be retained in version control`);
      }

      if (!version) {
        log.warn(`Unable to determine version to tag at - set '${ env.GIT_TAG }' to manually override.`);
        return;
      }

      await git.add(":/");
      await git.commit(`:bookmark: bump package version to ${ version }`);
      const gitTagAndPush = requireModule<GitTagAndPush>("git-tag-and-push");
      await gitTagAndPush(version);
    }
  );
})();
