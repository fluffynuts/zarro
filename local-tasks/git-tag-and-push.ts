export {}
const
  gitFactory = require("simple-git"),
  gutil = requireModule<GulpUtil>("gulp-util"),
  spawn = requireModule<Spawn>("spawn"),
  gulp = requireModule<GulpWithHelp>("gulp"),
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
    await spawn("npm", ["publish"], {
      interactive: true
    });
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
    const git = gitFactory(where || ".");
    await git.add(":/");
    await git.commit(comment);
  }
}

async function push(
  dryRun: boolean,
  where: string
) {
  await gitPush({
    dryRun,
    where
  });
  await gitPushTags({
    dryRun,
    where
  });
}

gulp.task("git-tag-and-push", async () => {
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

  // can tag in parallel
  await Promise.all([
    gitTag({
      tag,
      dryRun,
      where: "."
    }),
    gitTag({
      tag,
      dryRun,
      where: "gulp-tasks"
    }),
  ]);

  // can push in parallel, if it's quick enough so that the GH action doesn't
  // fail to get the submodule...
  await Promise.all([
    push(dryRun, "."),
    push(dryRun, "gulp-tasks")
  ]);
}