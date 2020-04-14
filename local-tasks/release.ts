export {}
const
  Git = require("simple-git/promise"),
  spawn = requireModule<Spawn>("spawn"),
  gulp = requireModule<GulpWithHelp>("gulp-with-help"),
  gitTag = requireModule<GitTag>("git-tag"),
  gitPushTags = requireModule<GitPushTags>("git-push-tags"),
  gitPush = requireModule<GitPush>("git-push"),
  env = requireModule<Env>("env"),
  readPackageVersion = requireModule<ReadPackageVersion>("read-package-version");

gulp.task("release", ["increment-package-json-version"], async () => {
  const
    dryRun = env.resolveFlag("DRY_RUN"),
    git = new Git();

  const version = await readPackageVersion();
  if (dryRun) {
    return;
  }
  await git.add(":/");
  await git.commit(":bookmark: bump package version");
  await gitTag(`v${ version }`);
  await spawn("npm", ["publish"]);
  await gitPush(dryRun);
  await gitPushTags(dryRun);
});
