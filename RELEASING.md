# Releasing zarro

Releases are published by GitHub Actions (`.github/workflows/release.yml`) using npm
**trusted publishing**: the workflow proves its identity to npm with OIDC, so there is no
npm token, no `npm login` and no 2FA prompt.

| event | what happens | npm tag |
| --- | --- | --- |
| a pull request from this repo (not dependabot) whose tests pass | publishes a **beta**: keeps major.minor, increments patch (1.217.0 -> 1.217.1); nothing is committed; a comment with the version is added to the PR | `beta` |
| a merge to `master` whose tests pass | publishes a **stable** release: keeps major, increments minor, patch 0 (1.217.1 -> 1.218.0); commits `:bookmark: bump package version to X` to master, tags `vX` and creates a GitHub release with generated notes | `latest` |

The version is worked out from the highest version on npm and in `package.json`
(`.github/scripts/next-release-version.js`, with tests in `tests/github-scripts`), so
betas keep counting up and two builds can't pick the same version. Publishes are
serialised.

## What doesn't publish

The tests always run. But a pull request or a merge which only touches `tests/`, `.github/`,
markdown (`*.md`, README included), lockfiles or `.gitignore` publishes **nothing**, neither a
beta nor a stable release. The `changes` job in the workflow decides this from the list of
changed files (`.github/scripts/is-shipping-change.js`, with tests in `tests/github-scripts`)
and lists those files in the run summary. Anything else counts as a change to the package,
including `package.json`, so a dependabot merge which changes `package.json` does release.

Separately, no beta is published for pull requests from forks or from dependabot.

## One-time setup on npmjs.com

This can only be done by a maintainer of the package, with 2FA.

1. Sign in at https://www.npmjs.com and open https://www.npmjs.com/package/zarro
2. Open the package's **Settings** tab.
3. Find the **Trusted Publisher** section and choose **GitHub Actions**.
4. Fill in:
   - Publisher: GitHub Actions
   - Label: anything you like
   - Organization or user: `fluffynuts`
   - Repository: `zarro`
   - Workflow filename: `release.yml` (including the extension; it is case-sensitive)
   - Environment name: leave empty. The workflow does not use a GitHub environment, and
     if you set one here the publish job must declare the same one.
5. Allowed actions: tick both **Allow `npm publish`** (the workflow publishes directly;
   only `npm stage publish` is allowed without it) and **Allow `npm dist-tag`** (the
   workflow publishes with `--tag beta` and `--tag latest`).
6. Choose **Set up connection**. npm does **not** check the values when you save: a typo
   only shows up as an authentication error on the first publish.

## Trying it

1. **Dry run** (changes nothing): GitHub > Actions > Release > Run workflow, branch `master`,
   kind `beta`, leave *dry run* ticked. The job summary shows the version it would publish
   and `npm publish --dry-run` runs. A dry run does **not** exercise the OIDC login.
2. **First real beta**: open a pull request from a branch in this repo. When the tests pass,
   the PR gets a comment with the published version. Check with `npm view zarro dist-tags`.
3. **First real stable release**: merge that pull request.

If a publish fails with an authentication error, check in this order: the workflow filename
and its case in the trusted publisher settings; that the job has `id-token: write`; the npm
version check step (needs npm >= 11.5.1); the two allowed-action options above.

## If a stable release publishes but the follow-up fails

The package is published before the version bump is committed. If the commit/push/release
step fails, the version is on npm but not in git: bump `package.json` to that version, commit
`:bookmark: bump package version to X`, tag `vX`, and create the GitHub release by hand.

## Cancelling a release run

Cancelling a run stops it, but does not undo what it already did. Tests take a few minutes;
after that the release job moves quickly: once `Publish to npm` has started, the version is on
npm, and the commit, tag and GitHub release follow within a minute or two (a cancel arriving
during that last step still leaves all of it done). npm doesn't let a version number be
reused, so to take a bad release back, publish a fixed one on top of it. If you want to stop
a release, cancel before the `Publish to npm` step.

## Releasing by hand

The old route still works: `npm run release-beta` (patch, `beta` tag) and `npm run release`
(minor, `latest`). It needs `npm login` and your 2FA code.
