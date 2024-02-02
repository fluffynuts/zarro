"use strict";
(function () {
    const gulp = requireModule("gulp");
    gulp.task("nuget-push", async () => {
        const env = requireModule("env"), runInParallel = requireModule("run-in-parallel"), nugetPush = requireModule("nuget-push"), { resolveNugetPushPackageFiles } = requireModule("resolve-nuget-push-package-files"), packageFiles = await resolveNugetPushPackageFiles(), nugetSrc = env.resolve("NUGET_PUSH_SOURCE");
        const actions = packageFiles.map(file => {
            return async () => await nugetPush(file, nugetSrc);
        });
        await runInParallel(2, ...actions);
    });
})();
