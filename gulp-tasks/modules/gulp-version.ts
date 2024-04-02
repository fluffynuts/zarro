(function() {
  const
    { readTextFileSync } = require("yafs"),
    entryPoint = require.resolve("gulp"),
    path = require("path"),
    containingFolder = path.dirname(entryPoint),
    packageJson = path.join(containingFolder, "package.json"),
    gulpInfo = readJson(packageJson),
    parts = gulpInfo.version.split(".").map(
      (s: string) => parseInt(s, 10)
    );

  function readJson(pathToFile: string): PackageIndex {
    const contents = readTextFileSync(pathToFile);
    return JSON.parse(contents) as PackageIndex;
  }

  module.exports = {
    major: parts[0],
    minor: parts[1],
    patch: parts[2]
  };
})();
