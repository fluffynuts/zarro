(function () {
  const gulp = requireModule<Gulp>("gulp");
  gulp.task("nuget-push", async () => {
    const
      env = requireModule<Env>("env"),
      runInParallel = requireModule<RunInParallel>("run-in-parallel"),
      nugetPush = requireModule<NugetPush>("nuget-push"),
      { resolveNugetPushPackageFiles } = requireModule<ResolveNugetPushPackageFiles>("resolve-nuget-push-package-files"),
      resolveNugetApiKey = requireModule<ResolveNugetApiKey>("resolve-nuget-api-key");

    const
      packageFiles = await resolveNugetPushPackageFiles();

    const
      nugetSrc = env.resolve("NUGET_PUSH_SOURCE"),
      apiKey = resolveNugetApiKey();

    for (const pkg of packageFiles) {
    }
  });

})();
