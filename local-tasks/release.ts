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
    rootGit = new Git(),
    gulpTasksGit = new Git("gulp-tasks");

  const
    version = await readPackageVersion(),
    tag = `v${ version }`;
  if (dryRun) {
    return;
  }
  await rootGit.add(":/");
  await rootGit.commit(":bookmark: bump package version");
  await gitTag(tag);

  await gulpTasksGit.add(":/");
  await gulpTasksGit.commit(`:bookmark: goes with zarro v${ version }`)
  await gitTag(tag, undefined, "gulp-tasks");
  await spawn("npm", ["publish"]);
  await gitPush(dryRun);
  await gitPushTags(dryRun);
});
