(function() {
  const
    gulp = requireModule<Gulp>("gulp"),
    env = requireModule<Env>("env"),
    gitTagAndPush = requireModule<GitTagAndPush>("git-tag-and-push");

  env.associate([
    env.GIT_TAG,
    env.GIT_VERSION_INCREMENT_MESSAGE,
    env.DRY_RUN
  ], [
    "git-tag-and-push"
  ]);

  gulp.task("git-tag-and-push", async () => {
    await gitTagAndPush(
      env.resolveRequired(env.GIT_TAG),
      env.resolveFlag(env.DRY_RUN)
    );
  });
})();
