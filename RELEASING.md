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

Merges which only touch `tests/`, `.github/`, markdown, `package-lock.json` or `.gitignore`
don't publish. Other merges to master do, including dependabot merges which change
`package.json`.

## One-time setup on npmjs.com

This can only be done by a maintainer of the package, with 2FA.

1. Sign in at https://www.npmjs.com and open https://www.npmjs.com/package/zarro
2. Open the package's **Settings** tab.
3. Find the **Trusted Publisher** section and choose **GitHub Actions**.
4. Fill in:
   - Organization or user: `fluffynuts`
   - Repository: `zarro`
   - Workflow filename: `release.yml` (including the extension; it is case-sensitive)
   - Environment name: leave empty
5. If there is an option to allow the workflow to manage **dist-tags**, enable it: the
   workflow publishes with `--tag beta` and `--tag latest`.
6. Save. npm does **not** check the values when you save: a typo only shows up as an
   authentication error on the first publish.

## Trying it

1. **Dry run** (changes nothing): GitHub > Actions > Release > Run workflow, branch `master`,
   kind `beta`, leave *dry run* ticked. The job summary shows the version it would publish
   and `npm publish --dry-run` runs. A dry run does **not** exercise the OIDC login.
2. **First real beta**: open a pull request from a branch in this repo. When the tests pass,
   the PR gets a comment with the published version. Check with `npm view zarro dist-tags`.
3. **First real stable release**: merge that pull request.

If a publish fails with an authentication error, check in this order: the workflow filename
and its case in the trusted publisher settings; that the job has `id-token: write`; the npm
version check step (needs npm >= 11.5.1); the dist-tag option above.

## If a stable release publishes but the follow-up fails

The package is published before the version bump is committed. If the commit/push/release
step fails, the version is on npm but not in git: bump `package.json` to that version, commit
`:bookmark: bump package version to X`, tag `vX`, and create the GitHub release by hand.

## Releasing by hand

The old route still works: `npm run release-beta` (patch, `beta` tag) and `npm run release`
(minor, `latest`). It needs `npm login` and your 2FA code.
