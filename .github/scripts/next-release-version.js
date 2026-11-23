#!/usr/bin/env node
// Works out the version the release workflow should publish next.
//
//   node next-release-version.js <beta|stable> <path-to-package.json> <path-to-published-versions.json>
//
// beta:   keep major.minor, increment patch   (published with the `beta` tag)
// stable: keep major, increment minor, patch 0 (published with the `latest` tag)
//
// The base is the highest of the package.json version and everything already
// published, so that two builds can't collide on a version and so betas keep
// counting up. Pre-release versions (eg 2.0.0-rc.1) are not considered.
const
  fs = require("fs"),
  semver = require("semver");

const kinds = [ "beta", "stable" ];

function computeNextVersion({ kind, packageVersion, publishedVersions }) {
  if (!kinds.includes(kind)) {
    throw new Error(`unknown release kind '${ kind }': expected one of ${ kinds.join(", ") }`);
  }
  if (!semver.valid(packageVersion)) {
    throw new Error(`package version '${ packageVersion }' is not a valid semver version`);
  }
  const
    candidates = [ packageVersion, ...publishedVersions ]
      .filter(v => semver.valid(v) && !semver.prerelease(v)),
    highest = candidates.sort(semver.rcompare)[0];
  return semver.inc(highest, kind === "beta" ? "patch" : "minor");
}

function parsePublishedVersions(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (e) {
    throw new Error(`unable to read the published versions: expected JSON from 'npm view <package> versions --json' but got: '${ (jsonText || "").slice(0, 80) }'`);
  }
  // npm prints a bare string, not an array, when there is only one version
  return Array.isArray(parsed) ? parsed : [ parsed ];
}

function main(argv) {
  const [ kind, packageJsonPath, publishedPath ] = argv;
  if (!kind || !packageJsonPath || !publishedPath) {
    throw new Error("usage: next-release-version.js <beta|stable> <package.json> <published-versions.json>");
  }
  const
    packageVersion = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")).version,
    publishedVersions = parsePublishedVersions(fs.readFileSync(publishedPath, "utf8"));
  return computeNextVersion({ kind, packageVersion, publishedVersions });
}

module.exports = { computeNextVersion, parsePublishedVersions };

if (require.main === module) {
  try {
    process.stdout.write(`${ main(process.argv.slice(2)) }\n`);
  } catch (e) {
    process.stderr.write(`${ e.message }\n`);
    process.exit(1);
  }
}
