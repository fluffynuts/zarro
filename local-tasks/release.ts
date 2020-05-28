export {}
const
  Git = require("simple-git/promise"),
  gutil = requireModule<GulpUtil>("gulp-util"),
  spawn = requireModule<Spawn>("spawn"),
  gulp = requireModule<GulpWithHelp>("gulp-with-help"),
  gitTag = requireModule<GitTag>("git-tag"),
  gitPushTags = requireModule<GitPushTags>("git-push-tags"),
  gitPush = requireModule<GitPush>("git-push"),
  env = requireModule<Env>("env"),
  readPackageVersion = requireModule<ReadPackageVersion>("read-package-version");

function log(str: string) {
  gutil.log(gutil.colors.green(str));
}

async function tryPublish(dryRun: boolean) {
  if (dryRun) {
    log("would publish...");
  } else {
    await spawn("npm", ["publish"]);
  }
}

async function commitAll(
  dryRun: boolean,
  where: string,
  comment: string
) {
  if (dryRun) {
    log(`would add & commit all from: ${ where }`);
  } else {
    const git = new Git(where || ".");
    await git.add(":/");
    await git.commit(comment);
  }
}

async function tagAndPush(
  dryRun: boolean,
  tag: string,
  where: string
) {
  await gitTag({
    tag,
    dryRun,
    where
  });
  await gitPush({
    dryRun,
    where
  });
  await gitPushTags({
    dryRun,
    where
  });
}

gulp.task("release", ["increment-package-json-version"], async () => {
  const
    dryRun = env.resolveFlag("DRY_RUN");

  await tryPublish(dryRun);
  await tagRelease(dryRun);
});

gulp.task("tag-release", async () => {
  const dryRun = env.resolveFlag("DRY_RUN");
  await tagRelease(dryRun);
});

async function tagRelease(dryRun: boolean) {
  const
    version = await readPackageVersion(),
    tag = `v${ version }`;

  // must commit all of gulp-tasks first so the updated module ends up committed with zarro
  await commitAll(dryRun, "gulp-tasks", `:bookmark: goes with zarro v${ version }`);
  await commitAll(dryRun, ".", ":bookmark: bump package version");

  // can tag and push in parallel
  await Promise.all([
    tagAndPush(dryRun, tag, "."),
    tagAndPush(dryRun, tag, "gulp-tasks")
  ]);
}
