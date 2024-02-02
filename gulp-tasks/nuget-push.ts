(function () {
  const gulp = requireModule<Gulp>("gulp");
  gulp.task("nuget-push", async () => {
    const
      env = requireModule<Env>("env"),
      runInParallel = requireModule<RunInParallel>("run-in-parallel"),
      nugetPush = requireModule<NugetPush>("nuget-push"),
      { resolveNugetPushPackageFiles } = requireModule<ResolveNugetPushPackageFiles>("resolve-nuget-push-package-files"),
      packageFiles = await resolveNugetPushPackageFiles(),
      nugetSrc = env.resolve("NUGET_PUSH_SOURCE");

    const actions = packageFiles.map(file => {
      return async() => await nugetPush(file, nugetSrc);
    });

    await runInParallel(2, ...actions);
  });

})();
