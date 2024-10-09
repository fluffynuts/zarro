import { ExecStepOverrideMessage } from "exec-step";

(function() {
  gulp.task(
    "nuget-push",
    "Pushes the latest versions of packages in the package build dir",
    async () => {
      const
        system = requireModule<System>("system"),
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
          async () => {
            const result = await nugetPush(
              path.join(folder, file)
            )
            if (system.isError(result)) {
              throw result;
            }
            if (system.isResult(result)) {
              const res = result as SystemResult;
              if (looksLikeNugetConflict(res)) {
                throw new ExecStepOverrideMessage(
                  `${ path.basename(file) } NOT pushed: this version already exists at the registry.`,
                  new Error('dummy'),
                  false
                );
              }
            }
          }
        );
      }
    }
  );

  const conflictMarkers = [
    "409",
    "already been pushed",
    "conflict http"
  ];

  function looksLikeNugetConflict(result: SystemResult): boolean {
    const io = result.stderr
      .concat(result.stdout)
      .map(line => line.toLowerCase());
    for (const line of io) {
      const current = conflictMarkers.reduce(
        (acc: boolean, cur: string) => acc || line.includes(cur),
        false
      );
      if (current) {
        return true;
      }
    }
    return false;
  }
})();
