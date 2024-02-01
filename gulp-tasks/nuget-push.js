"use strict";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("nuget-push", async () => {
        const env = requireModule("env"), runInParallel = requireModule("run-in-parallel"), nugetPush = requireModule("nuget-push"), { resolveNugetPushPackageFiles } = requireModule("resolve-nuget-push-package-files"), resolveNugetApiKey = requireModule("resolve-nuget-api-key");
        const packageFiles = await resolveNugetPushPackageFiles();
        const nugetSrc = env.resolve("NUGET_PUSH_SOURCE"), apiKey = resolveNugetApiKey();
        for (const pkg of packageFiles) {
        }
    });
})();
