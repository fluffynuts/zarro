(function () {
  gulp.task(
    "nuget-push",
    "Pushes the latest versions of packages in the package build dir",
    async () => {
      const
        { ctx } = require("exec-step"),
        debug = requireModule<DebugFactory>("debug")(__filename),
        path = require("path"),
        nugetPush = requireModule<NugetPush>("nuget-push"),
        {
          ls,
          FsEntities
        } = require("yafs"),
        env = requireModule<Env>("env"),
        folder = env.resolve(env.PACK_TARGET_FOLDER),
        versionRe = /^(?<id>[A-Za-z\.]+)\.(?<version>\d\.\d\.\d)(-(?<tag>.*))?\.nupkg$/,
        packages = await ls(folder, {
          recurse: false,
          entities: FsEntities.files,
          match: versionRe
        }),
        sorted = packages.sort().reverse(),
        seen = new Set<string>();
      if (sorted.length === 0) {
        throw new Error(`No .nupkg files found in ${ path.resolve(folder) }`);
      }
      const toPush = [] as string[];
      for (const file of sorted) {
        const
          match = file.match(versionRe),
          id = match?.groups["id"];
        if (seen.has(id)) {
          debug(`already seen ${ id }, skipping ${ file }`);
          continue;
        }
        seen.add(id);
        toPush.push(file);

      }

      if (env.resolveFlag(env.DRY_RUN)) {
        const log = requireModule<Log>("log");
        log.info("DRY_RUN set, would have pushed packages:");
        for (const item of toPush) {
          log.info(`  ${ item }`);
        }
        return;
      }

      for (const file of toPush) {
        await ctx.exec(
          `⬆️ pushing ${ file }`,
          async () =>
            await nugetPush(
              path.join(folder, file)
            )
        );
      }
    }
  );
})();
