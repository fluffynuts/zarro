(function () {
  const
    env = requireModule<Env>("env");

  async function gitTagAndPush(
    tag?: string,
    dryRun?: boolean
  ): Promise<void> {
    const
      gitTag = requireModule<GitTag>("git-tag"),
      gitPushTags = requireModule<GitPushTags>("git-push-tags"),
      gitPush = requireModule<GitPush>("git-push");

    if (!tag) {
      tag = env.resolveRequired(env.GIT_TAG);
    }
    if (dryRun === undefined) {
      dryRun = env.resolveFlag(env.DRY_RUN);
    }


    await gitTag({
      tag,
      dryRun
    });
    await gitPush(dryRun);
    await gitPushTags(dryRun);
  }

  module.exports = gitTagAndPush;
})();
